(() => {
  var W = 2;
  var N = 2;
  var state = [];
  var sort_show_flag = false;
  var num_of_state = 4;
  const Operator_name = [
    ["I", "Measure", "X", "Z", "H", "S", "Sd", "T", "Td", "Rx", "Ry", "Rz"],
    ["CI", "SCI", "CX", "CZ", "CH", "CS", "CSd", "CT", "CTd", "CRx", "CRy", "CRz"],
    ["I", "Fs", "Fe"]
  ];

  let Sim = new Simulate();

  const X_SHIFT = 0;
  const Y_SHIFT = 50;

  function make_button(name, left, top, id_name){
    if(name==="sort_show" || name==="simulate"){
      let button = document.createElement("button");
      button.setAttribute("id", id_name);
      button.setAttribute("class", name);
      button.setAttribute("type", "button");
      button.setAttribute("style", "cursor:pointer");
      if(name==="sort_show"){
        button.innerHTML = "SORT";
      }else if(name==="simulate"){
        button.innerHTML = "Simulate";
      }
      document.body.appendChild(button);
    }
    console.log(name);
    let button = document.getElementById(id_name);
    button.style.left = left + X_SHIFT + "px";
    button.style.top = top + Y_SHIFT + "px";
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
    canvas.remove();
  }

  function draw_operator_text(canvas){
    var width = canvas.width;
    var height = canvas.height;
    var ctx = canvas.getContext('2d');
    var img = new Image();
    var id = canvas.object.Operator_id;
    var flag = canvas.object.line_flag;
    console.log(flag, id);
    img.src = "./Figures/" + Operator_name[flag][id] + ".png";
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
    canvas.remove();
    delete_input_theta(x,y);
  }

  function check_switch(){
    var checkbox = document.getElementById("controll");
    checkbox.checked = false;
  }

  function delete_results(){
    let canvases = document.querySelectorAll(".result_left_top");
    for(let i=0; i<canvases.length; ++i) if(canvases[i]!=null) canvases[i].remove();
    canvases = document.querySelectorAll(".result-bar");
    for(let i=0; i<canvases.length; ++i) if(canvases[i]!=null) canvases[i].remove();
    canvases = document.querySelectorAll(".result-index");
    for(let i=0; i<canvases.length; ++i) if(canvases[i]!=null) canvases[i].remove();
    canvases = document.querySelectorAll(".sort_show");
    for(let i=0; i<canvases.length; ++i) if(canvases[i]!=null) canvases[i].remove();
    canvases = document.querySelectorAll(".result-canvas");
    for(let i=0; i<canvases.length; ++i) if(canvases[i]!=null) canvases[i].remove();
  }

  function make_result_canvas(){
    let canvas = document.createElement("canvas");
    canvas.setAttribute("class", "result-canvas");
    canvas.setAttribute("id", "result-canvas");
    canvas.style.position = "absolute";
    canvas.style.left = 50 + X_SHIFT + "px";
    canvas.style.top = 100*(N+2) + Y_SHIFT + "px";
    document.body.appendChild(canvas);
  }

  function draw_point_on_canvas(x, val){
    let canvas = document.getElementById("result-canvas");
    let ctx = canvas.getContext('2d');
    let width = canvas.width;
    let height = canvas.height;
    ctx.fillStyle = 'blue';
    ctx.fillRect(x*width, height*(1-val), 2, 2);
  }

  function make_result_left_top(shift){
    var canvas = document.createElement("canvas");
    canvas.setAttribute("class", "result_left_top");
    canvas.setAttribute("id", "result_left_top");
    canvas.style.position = "absolute";
    canvas.style.left = 50 + X_SHIFT + "px";
    canvas.style.top = 100*(N+2) + Y_SHIFT + 300*shift + "px";
    document.body.appendChild(canvas);
  }

  function make_result_bar(index, pos, val, width, shift){
    var canvas = document.createElement("canvas");
    canvas.setAttribute("class", "result-bar");
    canvas.setAttribute("id", "result-bar-"+index);
    canvas.style.position = "absolute";
    canvas.style.left = 100+pos*width+X_SHIFT+"px";
    canvas.style.top = 100*(N+2)+Y_SHIFT+300*shift+"px";
    canvas.width = width;
    var height = canvas.height;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = 'blue';
    ctx.fillRect(width/4, height*(1-val), width/2, height*val);
    document.body.appendChild(canvas);
  }

  function index_converter_to_string(index, show_elements_length){
    var str="";
    var index_copy = index;
    for(var i=0; i<show_elements_length; i++){
      str = String(index_copy%2) + str;
      index_copy=Math.floor(index_copy/2);
    }
    return str;
  }

  function make_result_index(index, pos, name, width, shift){
    var canvas = document.createElement("canvas");
    canvas.setAttribute("class", "result-index");
    canvas.setAttribute("id", "result-index-"+index);
    canvas.style.position = "absolute";
    canvas.style.left = 100+pos*width+X_SHIFT+"px";
    canvas.style.top = 100*(N+2)+200+Y_SHIFT+300*shift+"px";
    var ctx = canvas.getContext('2d');
    ctx.font = '64px serif';
    ctx.fillStyle = '#404040';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText(name, canvas.width/2, canvas.height/2);
    document.body.appendChild(canvas);
  }

  function make_result(index, pos, val, show_elements_length, shift){
    //var width = (N+2)*25; canvasの幅を動的に変更しようとしてできなかった
    var width = 100;
    make_result_bar(index, pos, val, width, shift);
    var index_string = index_converter_to_string(index, show_elements_length);
    make_result_index(index, pos, index_string, width, shift);
  }

  function show_results(measure_List){
    delete_results();

    make_result_canvas();

    for(let j=0; j<measure_List.length; ++j){
      let List = measure_List[j];
      List.forEach((value, key) => {
        draw_point_on_canvas((j+0.5)/measure_List.length, value);
      })
    }

    /*
    for(let j=0; j<measure_List.length; ++j){
      let state_all = [];
      make_result_left_top(j);
      let List = measure_List[j];
      List.forEach((value, key)=>{
        state_all.push([key, value]);
      });
      if(sort_show_flag){
        state_all.sort(function(a, b){return b[1]-a[1]});
      }else{
        state_all.sort(function(a, b){return a[0]-b[0]});
      }
      let measure_indices_length = 0;
      for(let i=0; (1<<i)<state_all.length; ++i){
        measure_indices_length++;
      }
      for(var i=0; i<state_all.length; i++){
        make_result(state_all[i][0], i, state_all[i][1], measure_indices_length, j);
      }
      make_button("sort_show", 20, 100*(N+4)+300*j+10, "sort_show"+j);
      document.querySelector('#sort_show'+j).addEventListener('click', () => {
        sort_show_flag = !sort_show_flag;
        show_results(measure_List);
      })
    }
    */
  }

  function init(){
    make_button("wbutton1", 25, 25, "wbutton1");
    document.querySelector('.wbutton1').addEventListener('click', () => {
      for(let y=0; y<N; ++y) make_operator(W,y);
      W++;
    })

    make_button("wbutton2", 125, 25, "wbutton2");
    document.querySelector('.wbutton2').addEventListener('click', () => {
      W--;
      if(W==0) W=1;
      else for(let y=0; y<N; ++y) delete_operator(W,y);
    })

    make_button("nbutton1", 225, 25, "nbutton1");
    document.querySelector('.nbutton1').addEventListener('click', () => {
      delete_results();
      make_zero(N);
      for(let x=0; x<W; ++x) make_operator(x,N);
      N++;
      num_of_state *= 2;
    })

    make_button("nbutton2", 325, 25, "nbutton2");
    document.querySelector('.nbutton2').addEventListener('click', () => {
      delete_results();
      N--;
      if(N==0){
        N=1;
      }else{
        num_of_state/=2;
        delete_zero(N);
        for(let x=0; x<W; ++x) delete_operator(x,N);
      }
    })

    make_button("simulate", 425, 25, "simulate");
    document.querySelector('.simulate').addEventListener('click', () => {
      sort_show_flag = false;
      let results = Sim.simulate(W,N,num_of_state);
      state = results[0];
      measure_List = results[1];
      show_results(measure_List);
      scroll();
    })
    check_switch();

    for(var y=0; y<N; y++){
      make_zero(y);

      for(var x=0; x<W; x++){
        make_operator(x,y);
      }
    }
  }

  function make_input_theta(iIdx,iIdy,canvas){
    let input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("name", "input");
    input.setAttribute("class", "theta");
    input.setAttribute("id", "theta-"+iIdx+"-"+iIdy);
    input.setAttribute("value", "0");

    input.style.width = 50 + "px";
    input.style.height = 10 + "px";
    input.style.position = "absolute";
    input.style.left = 100*(iIdx+1) + X_SHIFT + 25 + "px";
    input.style.top = 100*(iIdy+1) + Y_SHIFT + 80 + "px";

    input.addEventListener('keyup', () => {
      canvas.object.theta = input.value;
    })

    document.body.appendChild(input);
  }

  function delete_input_theta(iIdx,iIdy){
    let canvas = document.getElementById("theta-"+iIdx+"-"+iIdy);
    if(canvas!=null) canvas.remove();
  }

  function make_input_fornum(iIdx){
    let input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("name", "input");
    input.setAttribute("class", "fornum");
    input.setAttribute("id", "fornum-"+iIdx);
    input.setAttribute("value", "0");

    input.style.width = 50 + "px";
    input.style.height = 10 + "px";
    input.style.position = "absolute";
    input.style.left = 100*(iIdx+1) + X_SHIFT + 25 + "px";
    input.style.top = Y_SHIFT + 80 + "px";

    input.addEventListener('keyup', () => {
      let ob = document.getElementById("c"+iIdx+"-0").object;
      console.log("input.value = " + input.value);
      ob.for_num = input.value;
      console.log("c"+iIdx+"-0", ob.for_num);
    })

    document.body.appendChild(input);
  }

  function delete_input_fornum(iIdx){
    let canvas = document.getElementById("fornum-"+iIdx);
    if(canvas!=null) canvas.remove();
  }
 
  function Operator_Cell(iIdx,iIdy){
    var self = this;
    this.mIdx = iIdx;
    this.mIdy = iIdy;
    this.Operator_id = 0;
    this.line_flag = 0;
    this.theta = 0.0;
    this.for_num = 0;
    this.for_count = 0;
    if(iIdy>0){
      this.line_flag = document.getElementById("c"+iIdx+"-"+0).object.line_flag;
      if(this.line_flag===2){
        this.Operator_id = document.getElementById("c"+iIdx+"-"+0).object.Operator_id;
      }
    }
    // line_flag = 0 (nothing) 1 (controll) 2 (for)
    this.mCanvas = document.getElementById("c"+iIdx+"-"+iIdy);

    this.Click = function(e){
      console.log(""+self.mIdx+"-"+self.mIdy+" is clicked ");
      let controll_button = document.getElementById("controll");
      let for_button = document.getElementById("for");

      self.theta = 0.0;

      if(for_button.checked){
        if(self.line_flag===2){
          self.Operator_id += 1;
          self.Operator_id %= Operator_name[self.line_flag].length;
          for(let y=0; y<N; ++y){
            let another_canvas = document.getElementById("c"+self.mIdx+"-"+y);
            another_canvas.object.Operator_id = self.Operator_id;
            draw_operator_text(another_canvas);
          }
          if(self.Operator_id===2) make_input_fornum(self.mIdx);
          else delete_input_fornum(self.mIdx);
        }else{
          for(let y=0; y<N; ++y){
            let another_canvas = document.getElementById("c"+self.mIdx+"-"+y);
            console.log("c"+self.mIdx+"-"+y+" is selected ");
            if(another_canvas.object.line_flag!==2){
              another_canvas.object.line_flag = 2;
              another_canvas.object.Operator_id = 0;
            }
            delete_input_theta(self.mIdx,y);
            draw_operator_text(another_canvas);
          }
        }
      }else if(controll_button.checked){
        if(self.line_flag===1){
          self.Operator_id += 1;
          self.Operator_id %= Operator_name[self.line_flag].length;
          delete_input_theta(self.mIdx,self.mIdy);
          if(self.Operator_id-1 >= 8 && self.Operator_id-1 <= 10){
            make_input_theta(self.mIdx,self.mIdy,this);
          }
          draw_operator_text(self.mCanvas);
        }else{
          for(var y=0; y<N; y++){
            var another_canvas = document.getElementById("c"+self.mIdx+"-"+y);
            console.log("c"+self.mIdx+"-"+y+" is selected ");
            if(another_canvas.object.line_flag!==1){
              if(another_canvas.object.line_flag===2){
                delete_input_fornum(self.mIdx);
                another_canvas.object.Operator_id=0;
              }
              another_canvas.object.line_flag = 1;
              if(another_canvas.object.Operator_id==1){
                another_canvas.object.Operator_id=0;
              }
            }
            draw_operator_text(another_canvas);
          }
        }
      }else{
        if(self.line_flag!==0){
          for(var y=0; y<N; y++){
            var another_canvas = document.getElementById("c"+self.mIdx+"-"+y);
            if(another_canvas.object.line_flag!==0){
              if(another_canvas.object.line_flag===2){
                delete_input_fornum(self.mIdx);
                another_canvas.object.Operator_id=0;
              }
              another_canvas.object.line_flag=0;
              if(another_canvas.object.Operator_id==1){
                another_canvas.object.Operator_id=0;
              }
            }
            draw_operator_text(another_canvas);
          }
        }else{
          self.Operator_id += 1;
          self.Operator_id %= Operator_name[self.line_flag].length;
          delete_input_theta(self.mIdx,self.mIdy);
          if(self.Operator_id-1 >= 8 && self.Operator_id-1 <= 10){
            make_input_theta(self.mIdx,self.mIdy,this);
          }
          draw_operator_text(self.mCanvas);
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

  window.onload = function(){
    init();
  };

})();
