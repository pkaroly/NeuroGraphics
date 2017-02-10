d3.json("duration_interval.json", function(allPatients) { 

  // GLOBAL FLAG VALUES
  // plotCode 0: single patient
  //          1: multiple patients same plot
  //          2: sub-plot ??
  // 
  //colCode   0: no color coding
  //          1: type of seizure
  //          2: time of day
  //          3: patient
  //
  // GLOBAL VARIABLES
  // intScale, durScale, timeScale
  // xMap, yMap, xAxLab, yAxLab

  var col_default = '#FFFFFF',  // white
      col1 = '#F800F4', // pink
      col2 = '#F4F800',  // yellow
      col3 = '#00F4F8', // cyan
      trans = '0.8';      // transparency
 
  // Start with Patient 1
  var plotCode = 0;
  var seizurePlot = allPatients[0].seizures;
  // Removing the first seizure (which I set to interval = 0)
  seizurePlot = seizurePlot.slice(1,-1);
  var filtered_seizurePlot = seizurePlot.map(function(d) { return d; });


// select chart area
  var chart_area = d3.select("#chart_area");
  var frame = chart_area.append("svg");

// find the properties from our chart area html
  var chart_width = (chart_area[0][0].offsetWidth);
  var chart_height = (chart_area[0][0].offsetHeight);

// Set frame attributes width and height.
  frame.attr("width", chart_width);
  frame.attr("height", chart_height);

// create canvas
  var canvas = frame.append("g");

// set plot margins
  var margin = {top: 19.5, right: 19.5, bottom: 19.5, left: 29.5};
  var canvas_width = chart_width - margin.left - margin.right;
  var canvas_height = chart_height - margin.top - margin.bottom;

// Shift the canvas and make it slightly smaller than the svg canvas.
  canvas.attr("transform", "translate("+ margin.left +","+ margin.top +")")
  var data_canvas = canvas.append("g").attr("class", "data_canvas");

// the cursor pointer
    var tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")  
    .style("visibility", "hidden");

// axes scale initial
var scales = scaleAxes(seizurePlot);
var intScale = scales.intScale;
var durScale = scales.durScale;
var timeScale = scales.timeScale;
// color scale doesn't change with patient
var colScale = d3.scale.category20()
  .domain([1,2,3])
  .range([col1,col2,col3]);
var colScalePt = d3.scale.category20();

// THIS FUNCTION SCALES THE AXES FOR DIFFERENT PATIENTS
function scaleAxes(patient){
   var intScale = d3.scale.linear()
  .domain(d3.extent(patient,function(d){return d.interval;}))
  .range([0, canvas_width])
  .nice();
  var durScale = d3.scale.linear()
  .domain(d3.extent(patient,function(d){return d.duration;}))
  .range([canvas_height, 0])
  .nice();
  var timeScale = d3.scale.linear()
  .domain([d3.min(patient,function(d){return d.time;})/24/7,
           d3.max(patient,function(d){return d.time;})/24/7])
  .range([0, canvas_width])
  .nice();
  return {
    intScale: intScale,
    durScale: durScale,
    timeScale: timeScale
  };
}
// END scaleAxes


// Draw first axes (int vs dur)
// THESE VARIABLES ARE EDITED BY CHECKBOX FUNCTIONS
var xScale = intScale;
var xMap = function(d) {return d.interval}
var xAxLab = 'pre-seizure interval'
var yScale = durScale;
var yMap = function (d) {return d.duration}
var yAxLab = 'seizure duration'
drawAxes(xScale,yScale);

// THIS FUNCTION IS CALLED WHEN THE PLOT AXES CHANGE
function drawAxes(x,y) {
// remove any previous axes
  d3.selectAll(".axis").remove()

  // create the axes
  var xAxis = d3.svg.axis()
  .orient("bottom")
  .scale(x);
  var yAxis = d3.svg.axis()
  .orient("left")
  .scale(y);

  // draw axes
  // x axis
  canvas.append("g")
  .attr("class","axis")
  .attr("transform", "translate(0, "+ canvas_height +")")
  .call(xAxis)
  .append("text")
  .attr("class", "x-label")
  .attr("text-anchor", "end")
  .attr("x", canvas_width)
  .attr("y", - 6)
  .text(xAxLab);
  // y axis
  canvas.append("g")
  .attr("class","axis")
  .call(yAxis)
  .append("text")
  .attr("class", "y-label")
  .attr("text-anchor", "end")
  .attr("y", 6)
  .attr("dy", ".75em")
  .attr("transform", "rotate(-90)")
  .text(yAxLab);
}
//  END drawAxes

//  INTIALIZE FIRST PLOT
// CODE IS ACCESSED GLOBALLY. IT INDICATES WHAT COLORCODE MODE WE ARE IN
 var colCode = 1; 
 var dayThresh = 6;
 var nightThresh = 23;
// draw first plot
update(colCode)

// plotting function
  function update(code){
  var dot = data_canvas.selectAll(".dot")
                      .data(filtered_seizurePlot, function(d){return d.name});

  dot.enter().append("circle").attr("class","dot")
             .attr("r", 5)

  if (code==2){
    dot.on("mouseover", function(d){return tooltip.style("visibility", "visible").text(amOrPm(d.daytime)) ;})
       .on("mousemove", function(){return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
       .on("mouseout", function(){return tooltip.style("visibility", "hidden");})
  }
  else if (code==3){
    dot.on("mouseover", function(d){return tooltip.style("visibility", "visible").text('Patient ' + Number(d.name.slice(0,2))) ;})
       .on("mousemove", function(){return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
       .on("mouseout", function(){return tooltip.style("visibility", "hidden");})
  }


 if (code==0) {
  dot.style("fill",col_default)
     .style("stroke",col_default)
     .style("opacity",trans);
}
 else if (code == 1) {
 
  dot.style("fill",function(d) {return colScale(Number(d.type[d.type.length-1]) );})
     .style("stroke",function(d) {return colScale(Number(d.type[d.type.length-1]) );})
     .style("opacity",trans);

} else if (code == 2) {

  dot.style("fill",function(d) {
    return colScale((d.daytime >= nightThresh) || (d.daytime < dayThresh) ? 1 : 2)})
     .style("stroke",function(d) {
    return colScale((d.daytime >= nightThresh) || (d.daytime < dayThresh) ? 1 : 2)})
     .style("opacity",trans);

} else if (code == 3) {
  dot.style("fill",function(d) {return colScalePt(d.name.slice(0,2))})
     .style("stroke",function(d) {return colScalePt(d.name.slice(0,2))})
     .style("opacity",trans);
}

  dot.exit().remove()

  dot.transition().ease("linear").duration(500)
                  .attr("cx", function(d) {return xScale(xMap(d));})
                  .attr("cy", function(d) {return yScale(yMap(d));})

  }
  // END update()

  // START LISTENING TO CHECKBOXES NOW

// PLOT/PATIENT TYPE MASTER CHECK BOXES
d3.selectAll(".pt_cb_master").on("change",function(){
      plotCode = Number(this.value)

      //  ONLY DO SOMETHING WHEN SWITCH ON
      if (this.checked){
          // turn off all the master boxes except this one
          d3.selectAll(".pt_cb_master").property("checked",false);
          this.checked=true;
          if(plotCode==0){
            // resest to the first patient
            resetPatientToOne(0);
          } else if (plotCode==1){
            d3.selectAll(".pt_cb").property("checked",true)
            // reset to all patients
            seizurePlot = asSeizures(allPatients);
            filtered_seizurePlot = seizurePlot.map(function(d){return d;});
            
            // make the new axis scale
            var newScales = scaleAxes(seizurePlot);
            intScale = newScales.intScale;
            durScale = newScales.durScale;
            timeScale = newScales.timeScale;
            // re-initialize x and y to int and dur
            xScale = intScale;
            xMap = function(d) {return d.interval}
            xAxLab = 'pre-seizure interval'
            yScale = durScale;
            yMap = function (d) {return d.duration}
            yAxLab = 'seizure duration'
            drawAxes(xScale,yScale);            

            d3.selectAll(".sz_cb").property("checked",false).style("visibility","hidden")
            d3.selectAll(".sz_cb_master").property("checked",false)
            colCode = 0;
            update(colCode);
          }

      }
})

//  PATIENT CHECK BOXES
d3.selectAll(".pt_cb").on("change", function(){
    // the value of the checkbox is the patient index
    var this_patient = Number(this.value);
    //  single patient mode
    if(plotCode==0){
      // only do something if we're checking a box
      if(this.checked){
        // reset to the patient we just checked
        resetPatientToOne(this_patient);
      }
      // multi-patient mode
    } else if (plotCode==1){
      if(this.checked){
        // we want to add the checked patients seizures
        var new_sz = allPatients[this_patient].seizures;
        new_sz = new_sz.slice(1,-1)
        seizurePlot = seizurePlot.concat(new_sz);
        filtered_seizurePlot = seizurePlot;
        d3.select("#Boxes"+colCode).selectAll("input").property("checked",true)
      } else {
        // we want to remove the unchecked patients seizures
        seizurePlot = seizurePlot.filter(function(d){
          return Number(d.name.slice(0,2)) != (this_patient+1);
        })
        filtered_seizurePlot = filtered_seizurePlot.filter(function(d){
          // the seizure name starts with the patient number (add 1 to patient index)
          return Number(d.name.slice(0,2)) != (this_patient+1);
        })
      }
      var scales = scaleAxes(seizurePlot);
      intScale = scales.intScale;
      durScale = scales.durScale;
      timeScale = scales.timeScale;
      xScale = intScale;
      xMap = function(d) {return d.interval}
      xAxLab = 'pre-seizure interval'
      yScale = durScale;
      yMap = function (d) {return d.duration}
      yAxLab = 'seizure duration'
      drawAxes(intScale,durScale);
      update(colCode);
    }
    

})

// PLOT TYPE BOXES - These will change axes
d3.selectAll(".plot_cb").on("change", function(){
  var this_plot = Number(this.value);
  //  UNCHECK A BOX HERE
  if (!this.checked){ 
    //  we know there are only two so can get the other one
    if (d3.selectAll(".plot_cb")[0][Number(!this_plot)].checked) {
      xScale = timeScale;
      xMap = function (d){return d.time/24/7}
      xAxLab = 'time (weeks)'
      if (this_plot == 0){
        intScale.range([canvas_height, 0]);
        yScale = intScale;
        yMap = function (d){return d.interval}
        yAxLab = 'pre-seizure interval'
      }
      else {
        durScale.range([canvas_height, 0]);
        yScale = durScale;
        yMap = function (d){return d.duration}
        yAxLab = 'seizure duration'
      }      
    }
      // CHECK A BOX HERE
  } else {
    if (d3.selectAll(".plot_cb")[0][Number(!this_plot)].checked){
       intScale.range([0,canvas_width]);
       xScale = intScale;
       xMap = function (d){return d.interval}
       xAxLab = 'pre-seizure interval'
       yScale = durScale;
       yMap = function (d){return d.duration}
       yAxLab = 'seizure duration'
    } else {
      xScale = timeScale;
      xMap = function (d){return d.time/24/7}
      xAxLab = 'time (weeks)'
      if (this_plot==0) {
        yScale = durScale;
        yMap = function (d){return d.duration}
      } else {
        intScale.range([canvas_height, 0])
        yScale = intScale;
        yMap = function (d){return d.interval}
        yAxLab = 'pre-seizure interval'
      }
    }     

  }
  // REDRAW AXES AND PLOT
  drawAxes(xScale,yScale)
  update(colCode)
});


// COLOR CODE OPTION MASTER CHECKBOXES
 d3.selectAll(".sz_cb_master").on("change", function () {
  // global edit of color code
    colCode = this.value;  
    // the children of the master checkbox
    var these_boxes = d3.select('#Boxes'+colCode).selectAll(".sz_cb");
    // Go through the different color code options 
    // NB UPDATE ME WITH EACH NEW CODE TYPE
    for (i=1; i <= 3; i++){
      if (i==colCode){
        //  UNCHECK A BOX HERE
        if (!this.checked) {
          //  hide the children (hide your wife)
          these_boxes.property('checked',false)
          these_boxes.style('visibility','hidden')
          // reset to showing all seizures
          filtered_seizurePlot = seizurePlot.map(function(d) { return d; });
          colCode = 0;
          // CHECK A BOX  HERE
        } else {
          //  turn on all the other boxes
          these_boxes.style('visibility','visible')
          these_boxes.property('checked',true)
          // reset to showing all seizures
          filtered_seizurePlot = seizurePlot.map(function(d) { return d; });
        }
      } else {
        // turn off the boxes of other codes
        d3.select('#Boxes'+i).selectAll("input")
        .property('checked',false)
        d3.select('#Boxes'+i).selectAll(".sz_cb")
          .style("visibility","hidden")
      }
    }
  // redraw data points. Axes shouldn't change??
  update(colCode)
 });

//  HERE ARE THE MINOR COLOR CODE CHECKBOXES
    d3.selectAll(".sz_cb").on("change", function () {
      // global edit color code by looking at checkbox parent
      //colCode = d3.select(this.parentNode.parentNode.parentNode).attr("value");
      var codeVar = colCodeConvert(colCode);
      var mapping = colCodeIndicator(colCode);
    if (codeVar == 0)
      // put all the seizures back in
      filtered_seizurePlot = seizurePlot.map(function(d) { return d; });
    else {
    var this_sz = this.value;
    if (this_sz == 'Day'){
      mapping = colCodeIndicator(colCode,this_sz)
      this_sz = [dayThresh,nightThresh];
    } else if (this_sz=='Night'){
      mapping = colCodeIndicator(colCode,this_sz)
      this_sz = [nightThresh,dayThresh];
    }
    if (this.checked) { // adding data points 
      var new_sz = seizurePlot.filter(function(sz){
        return mapping(sz[codeVar],this_sz);
      });
      filtered_seizurePlot = filtered_seizurePlot.concat(new_sz);
        }
    else {
      filtered_seizurePlot = filtered_seizurePlot.filter(function(sz){
        return !mapping(sz[codeVar],this_sz);
      });
      }
    }
        update(colCode);
  });

//  This function restores the plot to default settings & plots patient no of index
function resetPatientToOne(index){
      // turn off all the other boxes except the one we want
      d3.selectAll(".pt_cb").property("checked",false);
      d3.selectAll(".pt_cb")[0][index].checked=true;

      seizurePlot = allPatients[index].seizures;
      // Removing the first seizure (which I set to interval = 0)
      seizurePlot = seizurePlot.slice(1,-1)
      filtered_seizurePlot = seizurePlot.map(function(d) { return d; });

      // make the new axis scale
      var newScales = scaleAxes(seizurePlot);
      intScale = newScales.intScale;
      durScale = newScales.durScale;
      timeScale = newScales.timeScale;
      // re-initialize x and y to whatever they were before
      var dur_on = d3.selectAll(".plot_cb")[0][0].checked;
      var int_on = d3.selectAll(".plot_cb")[0][1].checked;
      console.log(dur_on)
      if (dur_on && int_on){
        // plot duration vs int
          intScale.range([0,canvas_width]);
          xScale = intScale;
          xMap = function(d) {return d.interval}
          xAxLab = 'pre-seizure interval'
          yScale = durScale;
          yMap = function (d) {return d.duration}
          yAxLab = 'seizure duration'
          drawAxes(xScale,yScale);

        } else if (dur_on) {
          //  plot duration vs time
          xScale = timeScale;
          xMap = function (d){return d.time/24/7}
          xAxLab = 'time (weeks)'
          yScale = durScale;
          yMap = function (d) {return d.duration}
          yAxLab = 'seizure duration'
          drawAxes(xScale,yScale);

        } else {
          //  plot inteval vs time
          intScale.range([canvas_height, 0])
          xScale = timeScale;
          xMap = function (d){return d.time/24/7}
          xAxLab = 'time (weeks)'
          yScale = intScale;
          yMap = function (d) {return d.interval}
          yAxLab = 'pre-seizure interval'
          drawAxes(xScale,yScale);

        }


      checkBoxRestore(colCode)
      update(colCode);

}
// END resetPatientToOne


// function to put arbitrary patient array into seizure array
  function asSeizures(Patient){
    var out = Patient[0].seizures;
    out = out.slice(1,-1)

    for(i=1 ; i < Patient.length ; i++){
      var add_seizures = Patient[i].seizures;
      add_seizures = add_seizures.filter(function(d){return d.interval != 0});
      out = out.concat(add_seizures);
    }
    return out;
  }
  // END asSeizures

// restores checkboxes to original configuration
function checkBoxRestore(code){
  for(i=1 ; i<=3 ; i++){
    if(i==code){
        d3.select("#Boxes"+i).selectAll("input").property("checked",true)
  .style("visibility","visible");
    } else {
        d3.select("#Boxes"+i).selectAll("input").property("checked",false);
        d3.select("#Boxes"+i).selectAll(".sz_cb").style("visibility","hidden");
    }
  }
  // d3.selectAll(".plot_cb").property("checked",true);
}

function colCodeIndicator(code,arg){
        if (code==1)
          return function(d,val){return d == val};
        else if (code==2)
          if (arg == 'Day'){
            return function(d,val){
              return (d >= val[0]) && (d < val[1])}
          } else if (arg == 'Night') {
              return function(d,val){
                return (d >= val[0]) || (d < val[1])}
          }
        else 
          return function(d){return d}
}
// END colCodeIndicator

function colCodeConvert(code){
        if (code==1)
          return 'type';
        else if (code==2)
          return 'daytime'
        else 
          return code
}
// END colCodeConvert


function amOrPm(time){
  if (time == 0)
    return '12am'
  else if (time == 12)
    return '12pm'
  else if (time < 12)
    return time + 'am';
  else
    return (time - 12) + 'pm'
}
// END amOrPm

});