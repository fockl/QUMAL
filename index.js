(() => {
  var W = 2;
  var N = 2;
  var state = [];
  var sort_show_flag = false;
  var num_of_state = 4;
  const Operator_name = ["I", "X", "Z", "H", "S", "Sd", "T", "Td"];
  const sqrt2 = Math.sqrt(2);

  function Complex(real, imag){
    if (!(this instanceof Complex)){
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

  const X_SHIFT = 0;
  const Y_SHIFT = 50;

  function make_button(name, left, top){
    var button = document.createElement("button");
    button.setAttribute("id", name);
    button.setAttribute("class", name);
    button.setAttribute("type", "button");
    button.setAttribute("style", "cursor:pointer");
    button.style.position = "absolute";
    button.style.left = left + X_SHIFT + "px";
    button.style.top = top + Y_SHIFT + "px";
    var text = "";
    switch(name){
      case "wbutton1":
        text = "Add gate";
        break;
      case "wbutton2":
        text = "Delete gate";
        break;
      case "nbutton1":
        text = "Add qubit";
        break;
      case "nbutton2":
        text = "Delete qubit";
        break;
      case "simulate":
        text = "Simulate";
        break;
      case "sort_show":
        text = "SORT";
        break;
      default:
        break;
    }
    button.innerHTML = text;
    button.style.fontSize = "12px";
    document.body.appendChild(button);

    switch(name){
      case "wbutton1":
      case "wbutton2":
      case "nbutton1":
      case "nbutton2":
        button.object = new WN_button(name);
        break;
      case "simulate":
        button.object = new simulate_button(name);
        break;
      case "sort_show":
        button.object = new sort_show_button(name);
        break;
    }
  }

  function make_zero(y){
    var canvas = document.createElement("canvas");
    canvas.setAttribute("class", "zero");
    canvas.setAttribute("id", "z"+y);
    canvas.style.position = "absolute";
    canvas.style.left = X_SHIFT + "px";
    canvas.style.top = 100*(y+1) + Y_SHIFT + "px";
    var width = canvas.width;
    var height = canvas.height;
    var ctx = canvas.getContext('2d');
    var img = new Image();
    img.src = "./Figures/Zero.png"
    img.onload = function(){
      ctx.drawImage(img, 0, 0, width, height);
    }
    document.body.appendChild(canvas);
  }

  function delete_zero(y){
    var canvas = document.getElementById("z"+y);
    canvas.parentNode.removeChild(canvas);
  }

  function draw_operator_text(canvas){
    var width = canvas.width;
    var height = canvas.height;
    var ctx = canvas.getContext('2d');
    var img = new Image();
    var id = canvas.object.Operator_id;
    if(canvas.object.controll_flag){
      if(canvas.object.see_flag){
        img.src = "./Figures/SC" + Operator_name[id] + ".png";
      }else{
        img.src = "./Figures/C" + Operator_name[id] + ".png";
      }
    }else{
      img.src = "./Figures/" + Operator_name[id] + ".png";
    }
    ctx.clearRect(0, 0, width, height);
    img.onload = function(){
      ctx.drawImage(img, 0, 0, width, height);
    }
  };

  function make_operator(x, y){
    var canvas = document.createElement("canvas");
    canvas.setAttribute("class", "operator");
    canvas.setAttribute("id", "c"+x+"-"+y);
    canvas.style.position = "absolute";
    canvas.style.left = 100*(x+1) + X_SHIFT + "px";
    canvas.style.top = 100*(y+1) + Y_SHIFT + "px";
    document.body.appendChild(canvas);

    canvas.object = new Operator_Cell(x,y);

    draw_operator_text(canvas);
  }

  function delete_operator(x, y){
    console.log("x:"+x+",y:"+y);
    var canvas = document.getElementById("c"+x+"-"+y);
    canvas.parentNode.removeChild(canvas);
  }

  function check_switch(){
    var checkbox = document.getElementById("controll");
    checkbox.checked = false;
  }

  function delete_results(){
    var canvas = document.getElementById("result_left_top");
    if(canvas!=null){
      canvas.parentNode.removeChild(canvas);
    }
    for(var i=0; i<num_of_state; i++){
      canvas = document.getElementById("result-bar-"+i);
      if(canvas!=null){
        canvas.parentNode.removeChild(canvas);
      }
      canvas = document.getElementById("result-index-"+i);
      if(canvas!=null){
        canvas.parentNode.removeChild(canvas);
      }
    }
    var button = document.getElementById("sort_show");
    if(button!=null){
      button.parentNode.removeChild(button);
    }
  }

  function make_result_left_top(){
    var canvas = document.createElement("canvas");
    canvas.setAttribute("class", "result_left_top");
    canvas.setAttribute("id", "result_left_top");
    canvas.style.position = "absolute";
    canvas.style.left = 50 + X_SHIFT + "px";
    canvas.style.top = 100*(N+2) + Y_SHIFT + "px";
    document.body.appendChild(canvas);
  }

  function make_result_bar(index, pos, val, width){
    var canvas = document.createElement("canvas");
    canvas.setAttribute("class", "result-bar");
    canvas.setAttribute("id", "result-bar-"+index);
    canvas.style.position = "absolute";
    canvas.style.left = 100+pos*width+X_SHIFT+"px";
    canvas.style.top = 100*(N+2)+Y_SHIFT+"px";
    canvas.width = width;
    var height = canvas.height;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = 'blue';
    ctx.fillRect(width/4, height*(1-val), width/2, height*val);
    document.body.appendChild(canvas);
  }

  function index_converter_to_string(index){
    var str="";
    var index_copy = index;
    for(var i=0; i<N; i++){
      str = String(index_copy%2) + str;
      index_copy=Math.floor(index_copy/2);
    }
    return str;
  }

  function make_result_index(index, pos, name, width){
    var canvas = document.createElement("canvas");
    canvas.setAttribute("class", "result-index");
    canvas.setAttribute("id", "result-index-"+index);
    canvas.style.position = "absolute";
    canvas.style.left = 100+pos*width+X_SHIFT+"px";
    canvas.style.top = 100*(N+2)+200+Y_SHIFT+"px";
    var ctx = canvas.getContext('2d');
    ctx.font = '64px serif';
    ctx.fillStyle = '#404040';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText(name, canvas.width/2, canvas.height/2);
    document.body.appendChild(canvas);
  }

  function make_result(index, pos, val){
    //var width = (N+2)*25; canvasの幅を動的に変更しようとしてできなかった
    var width = 100;
    make_result_bar(index, pos, val, width);
    var index_string = index_converter_to_string(index);
    make_result_index(index, pos, index_string, width);
  }

  function show_results(){
    delete_results();
    make_result_left_top();
    var state_all = [];
    console.log("show_results")
    for(var i=0; i<num_of_state; i++){
      console.log("i:" + i + ", val:" + Complex_abs(state[i])*Complex_abs(state[i]));
      state_all.push([Complex_abs(state[i])*Complex_abs(state[i]), i]);
    }
    state_all.sort(function(a, b){return b[0]-a[0]});
    if(sort_show_flag){
      for(var i=0; i<num_of_state; i++){
        make_result(state_all[i][1], i, state_all[i][0]);
      }
    }else{
      for(var i=0; i<num_of_state; i++){
        make_result(i, i, Complex_abs(state[i])*Complex_abs(state[i]));
      }
    }
    make_button("sort_show", 25, 100*(N+5));
  }

  function init(){
    make_button("wbutton1", 25, 25);
    make_button("wbutton2", 125, 25);
    make_button("nbutton1", 225, 25);
    make_button("nbutton2", 325, 25);
    make_button("simulate", 425, 25);
    check_switch();

    for(var y=0; y<N; y++){
      make_zero(y);

      for(var x=0; x<W; x++){
        make_operator(x,y);
      }
    }
  }

 
  function Operator_Cell(iIdx,iIdy){
    var self = this;
    this.mIdx = iIdx;
    this.mIdy = iIdy;
    this.Operator_id = 0;
    if(iIdy>0){
      this.controll_flag = document.getElementById("c"+iIdx+"-"+0).object.controll_flag;
    }else{
      this.controll_flag = false;
    }
    this.see_flag = false;
    this.mCanvas = document.getElementById("c"+iIdx+"-"+iIdy);

    this.Click = function(e){
      console.log(""+self.mIdx+"-"+self.mIdy+" is clicked ");
      var input = document.getElementById("controll");

      if(input.checked){
        if(self.controll_flag){
          if(self.Operator_id==0){
            self.see_flag = !self.see_flag;
          }
        }
        for(var y=0; y<N; y++){
          var another_canvas = document.getElementById("c"+self.mIdx+"-"+y);
          another_canvas.object.controll_flag = true;
          draw_operator_text(another_canvas);
        }
      }else{
        if(self.controll_flag){
          for(var y=0; y<N; y++){
            var another_canvas = document.getElementById("c"+self.mIdx+"-"+y);
            another_canvas.object.controll_flag = false;
            another_canvas.object.see_flag = false;
            draw_operator_text(another_canvas);
          }
        }else{
          self.Operator_id += 1;
          self.Operator_id %= Operator_name.length;
          draw_operator_text(self.mCanvas);
        }
      }
    }

    this.mCanvas.onclick = this.Click;
  };

  function WN_button(name){
    var self = this;
    this.name = name;
    this.mCanvas = document.getElementById(name);

    this.Click = function(e){
      console.log(""+self.name+" is clicked ");
      if(name=="wbutton1"){
        for(var y=0; y<N; ++y){
          make_operator(W,y);
        }
        W++;
      }else if(name=="wbutton2"){
        W--;
        if(W==0){
          W=1;
        }else{
          for(var y=0; y<N; ++y){
            delete_operator(W,y);
          }
        }
      }else if(name=="nbutton1"){
        delete_results();
        make_zero(N);
        for(var x=0; x<W; ++x){
          make_operator(x,N);
        }
        N++;
        num_of_state *= 2;
      }else if(name=="nbutton2"){
        delete_results();
        N--;
        num_of_state /= 2;
        if(N==0){
          N=1;
          num_of_state = 2;
        }else{
          delete_zero(N);
          for(var x=0; x<W; ++x){
            delete_operator(x,N);
          }
        }
      }
    }

    this.mCanvas.onclick = this.Click;
  };

  function scroll(){
    /*
    var element = document.documentElement;
    var Target = element.scrollHeight - element.clientHeight;
    var Pos = window.pageYOffset;
    var move = Target/20;
    var interval = 1000/100;
    window.scrollBy(0, move);
    var rep = setTimeout(scroll, interval);
    if(Pos === Target){
      clearTimeout(rep);
    }
    //window.scrollTo(0, Target);
    */
  }

  function simulate_button(name){
    var self = this;
    this.name = name;
    this.mCanvas = document.getElementById(name);

    this.Click = function(e){
      console.log(""+self.name+" is clicked ");
      sort_show_flag = false;
      simulate();
      scroll();
    }

    this.mCanvas.onclick = this.Click;
  };

  function sort_show_button(name){
    var self = this;
    this.name = name;
    this.mCanvas = document.getElementById(name);

    this.Click = function(e){
      console.log(""+self.name+" is clicked ");
      sort_show_flag = !sort_show_flag;
      show_results();
    }

    this.mCanvas.onclick = this.Click;
  }

  function one_operation(index, op, state){
    var state_copy = [];
    for(var i=0; i<num_of_state; i++){
      state_copy.push(Complex(0.0, 0.0));
    }

    var IX = 1;
    var IZ = 1;
    for(var i=0; i<index; i++){
      IX *= 2;
    }
    for(var i=index+1; i<N; i++){
      IZ *= 2;
    }

    for(var ii=0; ii<2; ii++){
      for(var ix=0; ix<IX; ix++){
        for(var iy=0; iy<2; iy++){
          for(var iz=0; iz<IZ; iz++){
            var state1 = ix*2*IZ + ii*IZ + iz;
            var state2 = ix*2*IZ + iy*IZ + iz;
            state_copy[state1] = Complex_plus(state_copy[state1], Complex_prod(op[ii][iy], state[state2]));
          }
        }
      }
    }

    return state_copy;
  }

  function operations(index_set, id_set, state){
    for(var i=0; i<id_set.length; i++){
      var state_copy = one_operation(index_set[i], Operators[id_set[i]], state);
      for(var j=0; j<num_of_state; j++){
        state[j] = state_copy[j];
      }
    }
    return state
  }

  function some_operations(index_set, id_set, controll_set, state){
    var state_copy1 = [];
    var state_copy2 = [];
    var state_copy = []
    for(var i=0; i<num_of_state; i++){
      state_copy.push(Complex(0.0, 0.0));
      state_copy1.push(Complex(0.0, 0.0));
      state_copy2.push(Complex(0.0, 0.0));
    }
    if(controll_set.length>0){
      var last_index = controll_set.pop();
      state_copy1 = one_operation(last_index, Operator0, state);
      state_copy2 = one_operation(last_index, Operator1, state);
      state_copy2 = some_operations(index_set, id_set, controll_set, state_copy2);
      for(var i=0; i<num_of_state; i++){
        state_copy[i] = Complex_plus(state_copy1[i], state_copy2[i]);
      }
    }else{
      state_copy = operations(index_set, id_set, state);
    }
    return state_copy;
  }

  function simulate(){
    console.log("num_of_state : "+num_of_state);

    state = [];
    for(var i=0; i<num_of_state; i++){
      state.push(Complex(0.0, 0.0));
    }

    state[0] = Complex(1.0, 0.0);

    console.log(Complex(1.0, 0.0));

    console.log("state : "+JSON.stringify(state));

    for(var x=0; x<W; x++){
      var index_set = [];
      var id_set = [];
      var controll_set = []
      var controll_flag = document.getElementById("c"+x+"-0").object.controll_flag;
      for(var y=0; y<N; y++){
        var canvas = document.getElementById("c"+x+"-"+y);
        if(canvas.object.Operator_id!=0){
          index_set.push(y);
          id_set.push(canvas.object.Operator_id);
        }
        if(canvas.object.see_flag){
          controll_set.push(y);
        }
      }

      console.log(index_set, JSON.stringify(id_set));

      if(id_set.length==0){
        continue;
      }

      if(!controll_flag){
        state = operations(index_set, id_set, state);
      }else{
        state = some_operations(index_set, id_set, controll_set, state);
      }

      console.log("middle state : "+JSON.stringify(state));
    }
    console.log("final state : "+JSON.stringify(state));

    show_results();
  };

  window.onload = function(){
    init();
  };

})();
