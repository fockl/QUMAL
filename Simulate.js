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
  //I
  [
    [Complex(1.0, 0.0), Complex(0.0, 0.0)],
    [Complex(0.0, 0.0), Complex(1.0, 0.0)]
  ],
  //X
  [
    [Complex(0.0, 0.0), Complex(1.0, 0.0)],
    [Complex(1.0, 0.0), Complex(0.0, 0.0)]
  ],
  //Y
  [
    [Complex(0.0, 0.0), Complex(0.0, -1.0)],
    [Complex(0.0, 1.0), Complex(0.0, 0.0)]
  ],
  //Z
  [
    [Complex(1.0, 0.0), Complex(0.0, 0.0)],
    [Complex(0.0, 0.0), Complex(-1.0, 0.0)]
  ],
  //H
  [
    [Complex(1/sqrt2, 0.0), Complex(1/sqrt2, 0.0)],
    [Complex(1/sqrt2, 0.0), Complex(-1/sqrt2, 0.0)]
  ],
  //S
  [
    [Complex(1.0, 0.0), Complex(0.0, 0.0)],
    [Complex(0.0, 0.0), Complex(0.0, 1.0)]
  ],
  //S^dagger
  [
    [Complex(1.0, 0.0), Complex(0.0, 0.0)],
    [Complex(0.0, 0.0), Complex(0.0, -1.0)]
  ],
  //T
  [
    [Complex(1.0, 0.0), Complex(0.0, 0.0)],
    [Complex(0.0, 0.0), Complex(1/sqrt2, 1/sqrt2)]
  ],
  //T^dagger
  [
    [Complex(1.0, 0.0), Complex(0.0, 0.0)],
    [Complex(0.0, 0.0), Complex(1/sqrt2, -1/sqrt2)]
  ]
];

function Rx(theta){
  let c = Math.cos(theta/2);
  let s = Math.sin(theta/2);
   return [
     [Complex(c, 0.0), Complex(0.0, -s)],
     [Complex(0.0, -s), Complex(c, 0.0)]
   ];
}

function Ry(theta){
  let c = Math.cos(theta/2);
  let s = Math.sin(theta/2);
  return [
    [Complex(c, 0.0), Complex(-s, 0.0)],
    [Complex(s, 0.0), Complex(c, 0.0)]
  ];
}

function Rz(theta){
  let c = Math.cos(theta/2);
  let s = Math.sin(theta/2);
  return [
    [Complex(c, -s), Complex(0.0, 0.0)],
    [Complex(0.0, 0.0), Complex(c, s)]
  ];
}

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

  operations(index_set, operator_set, state){
    for(let i=0; i<operator_set.length; i++){
      let operator = [];
      let state_copy = this.one_operation(index_set[i], operator_set[i], state);
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


  measure_operations(index_set, operator_set, measure_set, state){
    let state_copy = [];
    state_copy = this.operations(index_set, operator_set, state);
    let List = new Map();
    for(let i=0; i<this.num_of_state; ++i){
      let index = this.__calc_index(i, measure_set);
      let value = 0;
      if(List.has(index)) value = List.get(index);
      List.set(index, Complex_abs(state_copy[i])*Complex_abs(state_copy[i])+value);
    }
    return [state_copy, List];
  }

  some_operations(index_set, operator_set, controll_set, state){
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
      state_copy2 = this.some_operations(index_set, operator_set, controll_set, state_copy2);
      for(let i=0; i<this.num_of_state; i++){
        state_copy[i] = Complex_plus(state_copy1[i], state_copy2[i]);
      }
    }else{
      state_copy = this.operations(index_set, operator_set, state);
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

    let pos = -1;

    let Fs_list = [];

    while(pos+1<this.W){
      pos++;
      console.log("pos = " + pos);
      let index_set = [];
      //let id_set = [];
      let operator_set = [];
      let controll_set = []
      let measure_set = []
      //let controll_flag = document.getElementById("c"+x+"-0").object.controll_flag;
      let line_flag = document.getElementById("c"+pos+"-0").object.line_flag;
      if(line_flag===2){
        let ob = document.getElementById("c"+pos+"-0").object;
        let ob_input = document.getElementById("fornum-"+pos);
        if(ob_input!==null) ob.for_num = ob_input.value;
        let ob_id = ob.Operator_id;
        let for_num = 0;
        if(!isNaN(ob.for_num)){
          for_num = Number(ob.for_num);
        }
        let for_count = ob.for_count;
        console.log(for_count, for_num, ob_id);
        if(ob_id===1){
          Fs_list.push(pos);
        }else if(ob_id===2){
          if(for_count>=for_num){
            ob.for_count = 0;
            Fs_list.pop();
          }else{
            ob.for_count++;
            pos = Fs_list[Fs_list.length-1];
          }
        }
        continue;
      }
      for(let y=0; y<this.N; y++){
        let canvas = document.getElementById("c"+pos+"-"+y);
        let id = canvas.object.Operator_id;
        let theta = 0.0;
        let ob_input = document.getElementById("theta-"+pos+"-"+y);
        if(ob_input!==null) canvas.object.theta = ob_input.value;
        if(!isNaN(canvas.object.theta)) theta = Number(canvas.object.theta)*Math.PI/180.0;
        console.log("theta = ", pos, y, theta, canvas.object.theta);
        if(id!=0){
          index_set.push(y);
          //id_set.push(canvas.object.Operator_id-1);
          if(id-1<Operators.length){
            operator_set.push(Operators[id-1]);
          }else if(id-1==Operators.length){
            operator_set.push(Rx(theta));
          }else if(id-1==Operators.length+1){
            operator_set.push(Ry(theta));
          }else if(id-1==Operators.length+2){
            operator_set.push(Rz(theta));
          }
        }
        if(canvas.object.Operator_id===1){
          if(line_flag===0){
            measure_set.push(y);
          }else if(line_flag===1){
            controll_set.push(y);
          }
        }
      }

      console.log(index_set, JSON.stringify(operator_set));

      if(operator_set.length==0){
        continue;
      }

      if(line_flag===0){
        if(measure_set.length>0){
          let tmp = this.measure_operations(index_set, operator_set, measure_set, state);
          state = tmp[0];
          measure_List.push(tmp[1]);
        }else{
          state = this.operations(index_set, operator_set, state);
        }
      }else{
        state = this.some_operations(index_set, operator_set, controll_set, state);
      }

      console.log("middle state : "+JSON.stringify(state));
    }
    console.log("final state : "+JSON.stringify(state));

    //show_results();
    return [state, measure_List];
  };
};
