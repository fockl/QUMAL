(function(){
  var W = 2;
  var N = 2;
  var state = [];
  var sort_show_flag = false;
  var num_of_state = 4;
  const Operator_name = [
    ["I", "Measure", "X", "Y", "Z", "H", "S", "Sd", "T", "Td", "Rx", "Ry", "Rz"],
    ["CI", "SCI", "CX", "CY", "CZ", "CH", "CS", "CSd", "CT", "CTd", "CRx", "CRy", "CRz"],
    ["I", "Fs", "Fe"]
  ];

  var Sim = new Simulate();

  const X_SHIFT = 0;
  const Y_SHIFT = 150;

  //{{{ Operator_Cell
  function Operator_Cell(iIdx,iIdy){
    var self = this;
    this.mIdx = iIdx;
    this.mIdy = iIdy;
    this.Operator_id = 0;
    this.line_flag = 0;
    this.theta = 0.0;
    this.for_num = 0;
    this.for_count = 0;

    var controll_flag = document.getElementById("controll"+iIdx).checked;
    if(controll_flag){
      this.line_flag += 1;
    }
    var for_flag = document.getElementById("for"+iIdx).checked;
    console.log(iIdx, iIdy, for_flag);
    if(for_flag){
      this.line_flag = 2;
      if(this.mIdy>0){
        this.Operator_id = document.getElementById("c"+iIdx+"-"+0).object.Operator_id;
      }
    }

    this.mCanvas = document.getElementById("c"+iIdx+"-"+iIdy);

    this.Click = function(e){
      console.log(""+self.mIdx+"-"+self.mIdy+" is clicked ");
      var controll_checkbox = document.getElementById("controll"+self.mIdx);
      var for_checkbox = document.getElementById("for"+self.mIdx);

      if(for_checkbox.checked){
        self.Operator_id += 1;
        self.Operator_id %= Operator_name[2].length;
        for(var y=0; y<N; ++y){
          var another_canvas = document.getElementById("c"+self.mIdx+"-"+y);
          another_canvas.object.Operator_id = self.Operator_id;
          show_operator(another_canvas);
        }
        if(self.Operator_id==2){
          make_input_fornum(self.mIdx);
        }else{
          delete_input_fornum(self.mIdx);
        }
      }else if(controll_checkbox.checked){
        self.Operator_id += 1;
        self.Operator_id %= Operator_name[self.line_flag].length;
        delete_input_theta(self.mIdx,self.mIdy);
        if(self.Operator_id-1>=9 && self.Operator_id-1<=11){
          make_input_theta(self.mIdx,self.mIdy,this);
        }
        show_operator(self.mCanvas);
      }else{
        self.Operator_id += 1;
        self.Operator_id %= Operator_name[0].length;
        delete_input_theta(self.mIdx,self.mIdy);
        if(self.Operator_id-1>=9 && self.Operator_id-1<=11){
          make_input_theta(self.mIdx,self.mIdy,this);
        }
        show_operator(self.mCanvas);
      }
    }
    this.mCanvas.onclick = this.Click;
  }
  //}}}

  //{{{ make_button
  function make_button(class_name, left, top, id_name, text){
    var button = document.createElement("button");
    button.setAttribute("id", id_name);
    button.setAttribute("class", class_name);
    button.setAttribute("type", "button");
    button.setAttribute("style", "cursor:pointer");
    button.innerHTML = text;
    document.body.appendChild(button);

    button.style.position = "absolute";
    button.style.left = left + X_SHIFT + "px";
    button.style.top = top + Y_SHIFT + "px";
  };
  //}}}

  //{{{ delete_button
  function delete_button(id_name){
    var button = document.getElementById(id_name);
    if(button!=null){
      button.remove();
    }
  }
  //}}}

  //{{{ make_zero
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
    img.src = "./Figures/Zero.png";
    img.onload = function(){
      ctx.drawImage(img,0,0,width,height);
    }
    document.body.appendChild(canvas);
  }
  //}}}

  //{{{ delete_zero
  function delete_zero(y){
    var canvas = document.getElementById("z"+y);
    if(canvas!=null){
      canvas.remove();
    }
  }
  //}}}

  //{{{ show_operator
  function show_operator(canvas){
    var width = canvas.width;
    var height = canvas.height;
    var ctx = canvas.getContext('2d');
    var img = new Image();
    var id = canvas.object.Operator_id;
    var line_flag = canvas.object.line_flag;
    if(line_flag>2){
      line_flag = 2;
    }
    img.src = "./Figures/" + Operator_name[line_flag][id] + ".png";
    ctx.clearRect(0, 0, width, height);
    img.onload = function(){
      ctx.drawImage(img, 0, 0, width, height);
    }
  }
  //}}}

  //{{{ make_operator
  function make_operator(x, y){
    var canvas = document.createElement("canvas");
    canvas.setAttribute("class", "operator");
    canvas.setAttribute("id", "c"+x+"-"+y);
    canvas.setAttribute("style", "cursor:pointer");
    canvas.style.position = "absolute";
    canvas.style.left = 100*(x+1) + X_SHIFT + "px";
    canvas.style.top = 100*(y+1) + Y_SHIFT + "px";
    document.body.appendChild(canvas);
    canvas.object = new Operator_Cell(x,y);
    show_operator(canvas);
  }
  //}}}

  //{{{ delete_operator
  function delete_operator(x,y){
    var canvas = document.getElementById("c"+x+"-"+y);
    if(canvas!=null){
      canvas.remove();
    }
    delete_input_theta(x,y);
  }
  //}}}

  //{{{ make_input_theta
  function make_input_theta(iIdx,iIdy,canvas){
    var input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("name", "input");
    input.setAttribute("class", "theta");
    input.setAttribute("id", "theta-"+iIdx+"-"+iIdy);
    input.setAttribute("value", "0");

    input.style.position = "absolute";
    input.style.left = 100*(iIdx+1) + X_SHIFT + 25 + "px";
    input.style.top = 100*(iIdy+1) + Y_SHIFT + 80 + "px";

    input.addEventListener('keyup', () => {
      canvas.object.theta = input.value;
    })
    document.body.appendChild(input);
  }
  //}}}

  //{{{ delete_input_theta
  function delete_input_theta(iIdx,iIdy){
    var canvas = document.getElementById("theta-"+iIdx+"-"+iIdy);
    if(canvas!=null){
      canvas.remove();
    }
  }
  //}}}

  //{{{ make_controll_checkbox
  function make_controll_checkbox(iIdx){
    var checkbox = document.createElement("input");
    checkbox.setAttribute("type", "checkbox");
    checkbox.setAttribute("class", "controll-checkbox");
    checkbox.setAttribute("id", "controll"+iIdx);
    checkbox.checked = false;

    checkbox.addEventListener('click', () => {
      var controll_flag = checkbox.checked;
      for(var i=0; i<N; ++i){
        var canvas = document.getElementById("c"+iIdx+"-"+i);
        if((canvas.object.line_flag)%2==0){
          canvas.object.line_flag+=1;
        }else{
          canvas.object.line_flag-=1;
        }
        show_operator(canvas);
      }
    });

    document.body.appendChild(checkbox);

    var label = document.createElement("label");
    label.setAttribute("for", "controll"+iIdx);
    label.setAttribute("class", "controll-label");
    label.setAttribute("id", "controll-label"+iIdx);
    label.setAttribute("style", "cursor:pointer");
    label.innerHTML = "Controll";

    label.style.position = "absolute";
    label.style.left = 100*(iIdx+1) + X_SHIFT + 25 + "px";
    label.style.top = 5 + Y_SHIFT + "px";

    document.body.appendChild(label);
  }
  //}}}

  //{{{ delete_controll_checkbox
  function delete_controll_checkbox(iIdx){
    var checkbox = document.getElementById("controll"+iIdx);
    if(checkbox!=null){
      checkbox.remove();
    }
    var label = document.getElementById("controll-label"+iIdx);
    if(label!=null){
      label.remove();
    }
  }
  //}}}

  //{{{ make_for_checkbox
  function make_for_checkbox(iIdx){
    var checkbox = document.createElement("input");
    checkbox.setAttribute("type", "checkbox");
    checkbox.setAttribute("class", "for-checkbox");
    checkbox.setAttribute("id", "for"+iIdx);
    checkbox.checked = false;

    checkbox.addEventListener('click', () => {
      delete_input_fornum(iIdx);
      for(var i=0; i<N; ++i){
        var canvas = document.getElementById("c"+iIdx+"-"+i);
        if(canvas.object.line_flag<2){
          canvas.object.line_flag+=2;
        }else{
          canvas.object.line_flag-=2;
        }
        canvas.object.Operator_id = 0;
        delete_input_theta(iIdx,i);
        show_operator(canvas);
      }
    });

    document.body.appendChild(checkbox);

    var label = document.createElement("label");
    label.setAttribute("for", "for"+iIdx);
    label.setAttribute("class", "for-label");
    label.setAttribute("id", "for-label"+iIdx);
    label.setAttribute("style", "cursor:pointer");
    label.innerHTML = "For";

    label.style.position = "absolute";
    label.style.left = 100*(iIdx+1) + X_SHIFT + 25 + "px";
    label.style.top = 40 + Y_SHIFT + "px";

    document.body.appendChild(label);
  }
  //}}}

  //{{{ delete_for_checkbox
  function delete_for_checkbox(iIdx){
    var checkbox = document.getElementById("for"+iIdx);
    if(checkbox!=null){
      checkbox.remove();
    }
    var label = document.getElementById("for-label"+iIdx);
    if(label!=null){
      label.remove();
    }
  }
  //}}}

  //{{{ make_input_fornum
  function make_input_fornum(iIdx){
    var input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("name", "input");
    input.setAttribute("class", "fornum");
    input.setAttribute("id", "fornum-"+iIdx);
    input.setAttribute("value", "0");

    input.style.position = "absolute";
    input.style.left = 100*(iIdx+1) + X_SHIFT + 25 + "px";
    input.style.top = Y_SHIFT + 80 + "px";

    input.addEventListener('keyup', () => {
      var ob = document.getElementById("c"+iIdx+"-0").object;
      ob.for_num = input.value;
    })

    document.body.appendChild(input);
  }
  //}}}

  //{{{ delete_input_fornum
  function delete_input_fornum(iIdx){
    var canvas = document.getElementById("fornum-"+iIdx);
    if(canvas!=null){
      canvas.remove();
    }
  }
  //}}}

  //{{{ index_converter_to_string
  function index_converter_to_string(index, show_elements_length){
    var str="";
    var index_copy = index;
    for(var i=0; i<show_elements_length; ++i){
      str = str + String(index_copy%2);
      index_copy=Math.floor(index_copy/2+0.1);
    }
    return str;
  }
  //}}}

  //{{{ make_result_bar
  function make_result_bar(index, pos, val, width, shift){
    var canvas = document.createElement("canvas");
    canvas.setAttribute("class", "result-bar");
    canvas.setAttribute("id", "result-bar-"+index);

    canvas.style.position = "absolute";
    canvas.style.left = 100 + pos*width + X_SHIFT + "px";
    canvas.style.top = 100*(N+1) + Y_SHIFT + 300*shift + "px";
    canvas.width = width;
    var height = canvas.height;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = 'blue';
    ctx.fillRect(width/4, height*(1-val), width/2, height*val);
    document.body.appendChild(canvas);
  }
  //}}}

  //{{{ make_result_index
  function make_result_index(index, pos, name, width, shift){
    var canvas = document.createElement("canvas");
    canvas.setAttribute("class", "result-index");
    canvas.setAttribute("id", "result-index-"+index);

    canvas.style.position = "absolute";
    canvas.style.left = 100 + pos*width + X_SHIFT + "px";
    canvas.style.top = 100*(N+1) + 200 + Y_SHIFT + 300*shift + "px";
    var ctx = canvas.getContext('2d');
    ctx.font = '64px serif';
    ctx.fillStyle = '#404040';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.fillText(name, canvas.width/2, canvas.height/2);
    document.body.appendChild(canvas);
  }
  //}}}

  //{{{ make_result
  function make_result(index, pos, val, show_elements_length, shift){
    var width = 100;
    make_result_bar(index, pos, val, width, shift);
    var index_string = index_converter_to_string(index, show_elements_length);
    index_string = "|" + index_string + ">";
    make_result_index(index, pos, index_string, width, shift);
  }
  //}}}

  //{{{ make_results
  function make_results(measure_List){

    for(var j=0; j<measure_List.length; ++j){
      var state_all = [];
      var List = measure_List[j];
      List.forEach((value, key)=>{
        state_all.push([key, value]);
        //console.log(key, value);
      });
      if(sort_show_flag){
        state_all.sort(function(a,b){return b[1]-a[1]});
      }else{
        state_all.sort(function(a,b){return a[0]-b[0]});
      }
      var measure_indices_length = 0;
      for(var i=0; (1<<i)<state_all.length; ++i){
        measure_indices_length++;
      }
      for(var i=0; i<state_all.length; ++i){
        make_result(state_all[i][0], i, state_all[i][1], measure_indices_length, j);
      }
      delete_button("sort-show"+j);
      make_button("sort_show", 20, 100*(N+3)+300*j+10, "sort-show"+j, "SORT");
      document.getElementById("sort-show"+j).addEventListener('click', () => {
        sort_show_flag = !sort_show_flag;
        delete_results();
        make_results(measure_List);
      })
    }
  }
  //}}}

  //{{{ delete_results
  function delete_results(){
    var canvases = document.querySelectorAll(".result-bar");
    for(var i=0; i<canvases.length; ++i){
      if(canvases[i]!=null){
        canvases[i].remove();
      }
    }
    canvases = document.querySelectorAll(".result-index");
    for(var i=0; i<canvases.length; ++i){
      if(canvases[i]!=null){
        canvases[i].remove();
      }
    }
    canvases = document.querySelectorAll(".result_show");
    for(var i=0; i<canvases.lenth; ++i){
      if(canvases[i]!=null){
        canvases[i].remove();
      }
    }
    canvases = document.querySelectorAll(".sort_show");
    for(var i=0; i<canvases.length; ++i){
      if(canvases[i]!=null){
        canvases[i].remove();
      }
    }
  }
  //}}}

  //{{{ draw_state
  function draw_state(state){
    delete_state();

    var canvas = document.createElement("font");
    canvas.setAttribute("class", "result-state");
    canvas.setAttribute("id", "result-state");
    canvas.setAttribute("size", "+2");

    canvas.style.position = "absolute";
    canvas.style.left = 20 + X_SHIFT + "px";
    canvas.style.top = 100*(N+1) + Y_SHIFT + "px";

    canvas.innerHTML = "";

    for(var i=0; i<state.length; ++i){
      var index = index_converter_to_string(i, N);
      var real = String(Math.abs(state[i].real).toFixed(8));
      if(state[i].real >= 0.0){
        real = "&nbsp;&nbsp;&nbsp;" + real;
      }else{
        real = "&nbsp;-&nbsp;" + real;
      }
      var imag = String(Math.abs(state[i].imag).toFixed(8)) + " i";
      if(state[i].imag >= 0.0){
        imag = "&nbsp;+&nbsp;" + imag;
      }else{
        imag = "&nbsp;-&nbsp;" + imag;
      }
      var prob = state[i].real * state[i].real + state[i].imag * state[i].imag;
      var prob_text = String(prob.toFixed(8));
      var text = "|" + index + ">&nbsp;:&nbsp;" + real + imag + "&nbsp;&nbsp;&nbsp;,&nbsp;&nbsp;Prob&nbsp;:&nbsp;" + prob_text + "<br>";
      console.log(text);
      canvas.innerHTML = canvas.innerHTML + text;
    }

    document.body.appendChild(canvas);
  }
  //}}}

  //{{{ delete_state
  function delete_state(){
    var canvas = document.getElementById("result-state");
    if(canvas!=null){
      canvas.remove();
    }
  }
  //}}}

  //{{{ sort_indices
  function sort_indices(array){
    var show_elements_length = 0;
    for(var i=0; (1<<i)<array.length; ++i){
      show_elements_length++;
    }
    var new_array = [];
    for(var i=0; i<array.length; ++i){
      var tmp = 0;
      var i_copy = i;
      for(var j=0; j<show_elements_length; ++j){
        tmp = tmp*2;
        tmp += i_copy%2;
        i_copy = Math.floor(i_copy/2+0.1);
      }
      new_array.push([tmp, array[i]]);
    }
    new_array.sort(function(a,b){return a[0]-b[0]});
    sorted_array = [];
    for(var i=0; i<new_array.length; ++i){
      sorted_array.push(new_array[i][1]);
    }
    return sorted_array;
  }
  //}}}

  //{{{ init
  function init(){
    document.getElementById("wbutton1").addEventListener('click', () => {
      make_controll_checkbox(W);
      make_for_checkbox(W);
      for(var y=0; y<N; ++y){
        make_operator(W, y);
      }
      W++;
    });

    document.getElementById("wbutton2").addEventListener('click', () => {
      W--;
      if(W==0){
        W=1;
      }else{
        for(var y=0; y<N; ++y){
          delete_operator(W, y);
          delete_input_theta(W, y);
        }
        delete_input_fornum(W);
        delete_controll_checkbox(W);
        delete_for_checkbox(W);
      }
    });

    document.getElementById("nbutton1").addEventListener('click', () => {
      delete_results();
      delete_state();
      make_zero(N);
      for(var x=0; x<W; ++x){
        make_operator(x, N);
      }
      N++;
      num_of_state *= 2;
    });

    document.getElementById("nbutton2").addEventListener('click', () => {
      delete_results();
      delete_state();
      N--;
      if(N==0){
        N=1;
      }else{
        num_of_state /= 2;
        delete_zero(N);
        for(var x=0; x<W; ++x){
          delete_operator(x, N);
          delete_input_theta(x, N);
        }
      }
    })

    document.getElementById("simulate").addEventListener('click', () => {
      sort_show_flag = false;
      var results = Sim.simulate(W,N,num_of_state);
      var state = results[0];
      var measure_List = results[1];
      delete_results();
      delete_state()
      if(measure_List.length>0){
        measure_List_new = [];
        for(var j=0; j<measure_List.length; ++j){
          var new_List = new Map();
          var show_elements_length = 0;
          for(var i=0; (1<<i)<measure_List[j].size; ++i){
            show_elements_length++;
          }
          measure_List[j].forEach((value, key) => {
            var new_key = 0;
            var key_copy = key;
            for(var k=0; k<show_elements_length; ++k){
              new_key *= 2;
              new_key += key_copy%2;
              key_copy = Math.floor(key_copy/2+0.1);
            }
            new_List.set(new_key, value);
          })
          measure_List_new.push(new_List);
        }
        make_results(measure_List_new);
      }else{
        state = sort_indices(state);
        draw_state(state);
      }
      scroll();
    })

    for(var x=0; x<W; ++x){
      make_controll_checkbox(x);
      make_for_checkbox(x);
    }
    for(var y=0; y<N; ++y){
      make_zero(y);
      for(var x=0; x<W; ++x){
        make_operator(x,y);
      }
    }
  };
  //}}}

  //{{{ scroll
  function scroll(){
    //TODO
  }
  //}}}

  window.onload = function(){
    init();
  };

})();
