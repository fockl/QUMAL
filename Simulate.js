//export class Simulate}

function Complex(real, imag){
  if(!(this instanceof Complex)){
    return new Complex(real, imag);
  }
  this.real = real;
  this.imag = imag;
}

function Complex_plus(c1, c2){
  return new Complex(c1.real+c2.real, c1.imag+c2.imag);
}
function Complex_prod(c1, c2){
  return new Complex(c1.real*c2.real-c1.imag*c2.imag, c1.real*c2.imag+c2.real*c1.imag);
}

function Complex_abs(c){
  return Math.sqrt(c.real*c.real+c.imag*c.imag);
}

const sqrt2 = Math.sqrt(2);

const Operators = [
  [
    [Complex(1.0, 0.0), Complex(0.0, 0.0)],
    [Complex(0.0, 0.0), Complex(1.0, 0.0)]
  ],
  [
    [Complex(0.0, 0.0), Complex(1.0, 0.0)],
    [Complex(1.0, 0.0), Complex(0.0, 0.0)]
  ],
  [
    [Complex(1.0, 0.0), Complex(0.0, 0.0)],
    [Complex(0.0, 0.0), Complex(-1.0, 0.0)]
  ],
  [
    [Complex(1/sqrt2, 0.0), Complex(1/sqrt2, 0.0)],
    [Complex(1/sqrt2, 0.0), Complex(-1/sqrt2, 0.0)]
  ],
  [
    [Complex(1.0, 0.0), Complex(0.0, 0.0)],
    [Complex(0.0, 0.0), Complex(0.0, 1.0)]
  ],
  [
    [Complex(1.0, 0.0), Complex(0.0, 0.0)],
    [Complex(0.0, 0.0), Complex(0.0, -1.0)]
  ],
  [
    [Complex(1.0, 0.0), Complex(0.0, 0.0)],
    [Complex(0.0, 0.0), Complex(1/sqrt2, 1/sqrt2)]
  ],
  [
    [Complex(1.0, 0.0), Complex(0.0, 0.0)],
    [Complex(0.0, 0.0), Complex(1/sqrt2, -1/sqrt2)]
  ]
];

  /*
   * Rx(theta) = [
   *   [Complex(Math.cos(theta/2, 0.0)), Complex(0.0, -Math.sin(theta/2))],
   *   [-Complex(0.0, Math.sin(theta/2)), Complex(Math.cos(theta/2), 0.0)]
   * ]
   *
   * Ry(theta) = [
   *   [Complex(Math.cos(theta/2, 0.0)), Complex(-Math.sin(theta/2), 0.0)],
   *   [Complex(-Math.sin(theta/2, 0.0)), Complex(Math.cos(theta/2), 0.0)]
   * ]
   *
   * Rz(theta) = [
   *   [Complex(1.0, 0.0), Complex(0.0, 0.0)],
   *   [Complex(0.0, 0.0), Complex(Math.cos(theta), Math.sin(theta))]
   * ]
   *
  */

const Operator0 = [
  [Complex(1.0, 0.0), Complex(0.0, 0.0)],
  [Complex(0.0, 0.0), Complex(0.0, 0.0)]
];

const Operator1 = [
  [Complex(0.0, 0.0), Complex(0.0, 0.0)],
  [Complex(0.0, 0.0), Complex(1.0, 0.0)]
];

class Simulate{
  constructor(){
    this.N = 2;
    this.W = 2;
    return;
  }
  one_operation(index, op, state){
    var state_copy = [];
    for(var i=0; i<this.num_of_state; i++){
      state_copy.push(Complex(0.0, 0.0));
    }

    var IX = 1;
    var IZ = 1;
    for(let i=0; i<index; i++){
      IX *= 2;
    }
    for(let i=index+1; i<this.N; i++){
      IZ *= 2;
    }

    for(var ii=0; ii<2; ii++){
      for(var ix=0; ix<IX; ix++){
        for(var iy=0; iy<2; iy++){
          for(var iz=0; iz<IZ; iz++){
            let state1 = ix*2*IZ + ii*IZ + iz;
            let state2 = ix*2*IZ + iy*IZ + iz;
            state_copy[state1] = Complex_plus(state_copy[state1], Complex_prod(op[ii][iy], state[state2]));
          }
        }
      }
    }

    return state_copy;
  }

  operations(index_set, id_set, state){
    for(let i=0; i<id_set.length; i++){
      let state_copy = this.one_operation(index_set[i], Operators[id_set[i]], state);
      for(let j=0; j<this.num_of_state; j++){
        state[j] = state_copy[j];
      }
    }
    return state
  }

  __calc_index(i, measure_set){
    let ans = 0;
    for(let j=0; j<measure_set.length; ++j){
      let tmp = 1<<(this.N-1-measure_set[j]);
      ans <<= 1;
      if((tmp&i)!=0) ans += 1;
    }
    return ans;
  }


  measure_operations(index_set, id_set, measure_set, state){
    let state_copy = [];
    state_copy = this.operations(index_set, id_set, state);
    let List = new Map();
    for(let i=0; i<this.num_of_state; ++i){
      let index = this.__calc_index(i, measure_set);
      let value = 0;
      if(List.has(index)) value = List.get(index);
      List.set(index, Complex_abs(state_copy[i])*Complex_abs(state_copy[i])+value);
    }
    return [state_copy, List];
  }

  some_operations(index_set, id_set, controll_set, state){
    let state_copy1 = [];
    let state_copy2 = [];
    let state_copy = []
    for(let i=0; i<this.num_of_state; i++){
      state_copy.push(Complex(0.0, 0.0));
      state_copy1.push(Complex(0.0, 0.0));
      state_copy2.push(Complex(0.0, 0.0));
    }
    if(controll_set.length>0){
      let last_index = controll_set.pop();
      state_copy1 = this.one_operation(last_index, Operator0, state);
      state_copy2 = this.one_operation(last_index, Operator1, state);
      state_copy2 = this.some_operations(index_set, id_set, controll_set, state_copy2);
      for(let i=0; i<this.num_of_state; i++){
        state_copy[i] = Complex_plus(state_copy1[i], state_copy2[i]);
      }
    }else{
      state_copy = this.operations(index_set, id_set, state);
    }
    return state_copy;
  }

  simulate(W,N,num_of_state){
    console.log("num_of_state : "+num_of_state);

    this.W = W;
    this.N = N;
    this.num_of_state = num_of_state
    let state = [];
    for(let i=0; i<this.num_of_state; i++){
      state.push(Complex(0.0, 0.0));
    }

    state[0] = Complex(1.0, 0.0);

    console.log("state : "+JSON.stringify(state));

    let measure_List = [];

    for(let x=0; x<this.W; x++){
      let index_set = [];
      let id_set = [];
      let controll_set = []
      let measure_set = []
      //let controll_flag = document.getElementById("c"+x+"-0").object.controll_flag;
      let line_flag = document.getElementById("c"+x+"-0").object.line_flag;
      for(let y=0; y<this.N; y++){
        let canvas = document.getElementById("c"+x+"-"+y);
        if(canvas.object.Operator_id!=0){
          index_set.push(y);
          id_set.push(canvas.object.Operator_id-1);
        }
        if(canvas.object.Operator_id===1){
          if(line_flag===0){
            measure_set.push(y);
          }else if(line_flag===1){
            controll_set.push(y);
          }
        }
      }

      console.log(index_set, JSON.stringify(id_set));

      if(id_set.length==0){
        continue;
      }


      if(line_flag===0){
        if(measure_set.length>0){
          let tmp = this.measure_operations(index_set, id_set, measure_set, state);
          state = tmp[0];
          measure_List.push(tmp[1]);
        }else{
          state = this.operations(index_set, id_set, state);
        }
      }else{
        state = this.some_operations(index_set, id_set, controll_set, state);
      }

      console.log("middle state : "+JSON.stringify(state));
    }
    console.log("final state : "+JSON.stringify(state));

    if(measure_List.length===0){
      let measure_set = [];
      for(let i=0; i<N; ++i) measure_set.push(i);
      let tmp = this.measure_operations([], [], measure_set, state);
      measure_List.push(tmp[1]);
    }

    //show_results();
    return [state, measure_List];
  };
};
