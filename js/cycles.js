d3.json("patients.json", function(allPatients) { 

  // GLOBAL FLAG VALUES
  // timeCode 0: time of day
  //          1: day of week
  //          2: day of fortnight
  //          3: date of month
 //           4: month
 //           5: year

  //
  // GLOBAL VARIABLES
  // xMap, xScale, yMap, yScale, xAxLab, yAxLab

  var col_default = '#FFFFFF',  // white
      col1 = '#DC143C',
      col2 = '#6495ED', // cyan
      trans = '0.8';      // transparency
 
  // Start with Patient 1
  var burstOn = 0;
  var timeCode = 0;
  var roundOn = 1;
  var plotR = 2;
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

// init range
  var zoomMax = d3.max(seizurePlot,function(d){return d.time;});
  var R1 = 0;
  var R2 = zoomMax;
  drawSlider(zoomMax);


// axes scale initial
var scales = scaleAxes(seizurePlot,timeCode,R1,R2);
var xScale = scales.xScale;
var xMap = scales.xMap;
var xAxLab = scales.xAxLab;
var yScale = scales.yScale;
var yMap = scales.yMap;
var yAxLab = scales.yAxLab;

// color scale doesn't change with patient
var colScale = d3.scale.category20()
  .domain([1,2])
  .range([col1,col2]);


// THIS FUNCTION SCALES THE AXES FOR DIFFERENT PATIENTS
function scaleAxes(patient,timeCode,R1,R2){

  if (timeCode == 0) {
      var yScale = d3.scale.linear()
      .domain([0, 23])
      .range([canvas_height, 0])
      .nice();
      if (roundOn==1) {
        var yMap = function(d) {return d.daytime};
      } else {
        var yMap = function(d) {return Math.floor(d.daytime)};
      }
      var yAxLab = 'time of day';

      var xScale = d3.scale.linear()
      .domain([R1,R2])
      .range([0, canvas_width])
      .nice();
      var xMap = function (d) {return d.time}
      var xAxLab = 'day'
// BY DAY OF WEEK
  } else if (timeCode == 1){

      var yScale = d3.scale.linear()
      .domain([1, 8])
      .range([canvas_height, 0])
      .nice();
      if (roundOn==1) {
        var yMap = function(d) {return d.weektime};
      } else {
        var yMap = function(d) {return Math.floor(d.weektime)};
      }
      var yAxLab = 'day of week';

      var xScale = d3.scale.linear()
      .domain([R1, R2])
      .range([0, canvas_width])
      .nice();
      var xMap = function (d) {return d.time/28}
      var xAxLab = 'month'
  // BY FORTNIGHT
  } else if (timeCode == 2) {
      var yScale = d3.scale.linear()
      .domain([0, 14])
      .range([canvas_height, 0])
      .nice();
      if (roundOn==1) {
        var yMap = function(d) {return d.forttime};
      } else {
        var yMap = function(d) {return Math.floor(d.forttime)};
      }      
      var yAxLab = 'day of fortnight';

      var xScale = d3.scale.linear()
      .domain([R1,R2])
      .range([0, canvas_width])
      .nice();
      var xMap = function (d) {return d.time/28}
      var xAxLab = 'month'
  //  DAY OF MONTH
  } else if (timeCode == 3){
      var yScale = d3.scale.linear()
      .domain([0, 31])
      .range([canvas_height, 0])
      .nice();
      if (roundOn==1){
        var yMap = function(d) {return d.datettime};  
      } else {
        var yMap = function(d) {return Math.floor(d.datettime)};
      }      
      var yAxLab = 'day of month';

      var xScale = d3.scale.linear()
      .domain([R1,R2])
      .range([0, canvas_width])
      .nice();
      var xMap = function (d) {return d.time/28}
      var xAxLab = 'month'
//  BY  MONTH
  } else if (timeCode == 4){
      var yScale = d3.scale.linear()
      .domain([0, 13])
      .range([canvas_height, 0])
      .nice();
      if (roundOn==1){
        var yMap = function(d) {return d.monthtime};
      } else {
        var yMap = function(d) {return Math.floor(d.monthtime)};
      }      
      var yAxLab = 'month of year';

      var xScale = d3.scale.linear()
      .domain([R1,R2])
      .range([0, canvas_width])
      .nice();
      var xMap = function (d) {return d.time/365}
      var xAxLab = 'years'
  } else if (timeCode == 5){
      var yScale = d3.scale.linear()
      .domain([-9, 10])
      .range([canvas_height, 0])
      .nice();
      var yMap = function(d) {return d.jitter};
      var yAxLab = '';

      var xScale = d3.scale.linear()
      .domain([R1,R2])
      .range([0, canvas_width])
      .nice();
      var xMap = function (d) {return d.time/365}
      var xAxLab = 'years'
  }


  return {
    xScale: xScale,
    xMap: xMap,
    xAxLab: xAxLab,
    yScale: yScale,
    yMap: yMap,
    yAxLab: yAxLab,
  };

}
// END scaleAxes

// Draw first axes
drawAxes(xScale,yScale,timeCode);

// THIS FUNCTION IS CALLED WHEN THE PLOT AXES CHANGE
function drawAxes(x,y,timeCode) {
// remove any previous axes
  d3.selectAll(".axis").remove()

  // create the axes
  var xAxis = d3.svg.axis()
  .orient("bottom")
  .scale(x);
  var yAxis = d3.svg.axis()
  .orient("left")
  .scale(y);

  if (timeCode == 5) {
    yAxis.ticks(0);
  }

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
update()

// plotting function
  function update(){
  var dot = data_canvas.selectAll(".dot")
                      .data(filtered_seizurePlot, function(d){return d.name});

  dot.enter().append("circle").attr("class","dot")
             .attr("r", plotR)

  dot.exit().remove()

  dot.transition().ease("linear").duration(500)
                  .attr("cx", function(d) {return xScale(xMap(d));})
                  .attr("cy", function(d) {return yScale(yMap(d));})
                  .attr("r",plotR)

  if (burstOn==1){
      dot.style("fill",function(d) {
        if (d.burst == 0) {
          return col_default;
        } else {
          return col1;
        }
      })
     .style("stroke",function(d) {
        if (d.burst == 0) {
          return col_default;
        } else {
          return col1;
        }
     })
     .style("opacity",trans);
 } else {
    dot.style("fill",function(d) {return colScale(Number(d.type[d.type.length-1]) );})
     .style("stroke",function(d) {return colScale(Number(d.type[d.type.length-1]) );})
     .style("opacity",trans); 
  }

  }
  // END update()

    function drawSlider(zoomMax){

  d3.select('#zoomRange').call(d3.slider()
        .axis(false)
        .min(0).max(zoomMax)
        .value( [0, zoomMax] )
        .on("slide", function(evt, value) {
      // make the new axis scale
      var newScales = scaleAxes(seizurePlot,timeCode,value[ 0 ],value[ 1 ]);
      xScale = newScales.xScale;
      xMap = newScales.xMap;
      xAxLab = newScales.xAxLab;
      yScale = newScales.yScale;
      yMap = newScales.yMap;
      yAxLab = newScales.yAxLab;

      // plot on new scale
      xScale.range([0,canvas_width]);
      yScale.range([canvas_height,0]);
      drawAxes(xScale,yScale,timeCode);

      update();
    }));
}

  // START LISTENING TO CHECKBOXES NOW
  //  VALUE ROUNDING
  d3.select('#round').on("change",function(){
    roundOn = this.checked;
    // make the new axis scale
      var newScales = scaleAxes(seizurePlot,timeCode,R1,R2);
      xScale = newScales.xScale;
      xMap = newScales.xMap;
      xAxLab = newScales.xAxLab;
      yScale = newScales.yScale;
      yMap = newScales.yMap;
      yAxLab = newScales.yAxLab;
    update();
  })

  // PLOT RADIUS SLIDER
  d3.select("#plotR").call(d3.slider()
    .axis(false)
    .min(2).max(8).step(1).value(2)
    .on("slide",function(evt,value){
      plotR = value;
      update()
    })
    )

  //  TIME SLIDER
  d3.select("#timeRange").call(d3.slider()
    .axis(false)
    .min(0).max(5).step(1).value(0)
    .on("slide",function(evt,value){
    timeCode = value;
      if (timeCode == 0){
        d3.select("#binSizeHeading").text("Hour of Day");
        zoomMax = d3.max(seizurePlot,function(d){return d.time;});
      } else if (timeCode == 1 | timeCode == 2 | timeCode == 3){
         zoomMax = d3.max(seizurePlot,function(d){return d.time / 28;});
         if (timeCode==1){
          d3.select("#binSizeHeading").text("Day of Week");
        } else if (timeCode==2){
          d3.select("#binSizeHeading").text("Day of Fortnight");
        } else {
          d3.select("#binSizeHeading").text("Day of Month");
        }
      } else if (timeCode == 4 | timeCode == 5){
        zoomMax = d3.max(seizurePlot,function(d){return d.time / 365;});
        if (timeCode==4){
          d3.select("#binSizeHeading").text("Month of Year");  
        } else {
          d3.select("#binSizeHeading").text("All Data");
        }      
        
      }
     
      R1 = 0;
      R2 = zoomMax;
      d3.select("#zoomRange").selectAll('.d3-slider-range').remove();
      d3.select("#zoomRange").selectAll('.d3-slider-handle').remove();
      drawSlider(zoomMax)

    // make the new axis scale
    var newScales = scaleAxes(seizurePlot,timeCode,R1,R2);
    xScale = newScales.xScale;
    xMap = newScales.xMap;
    xAxLab = newScales.xAxLab;
    yScale = newScales.yScale;
    yMap = newScales.yMap;
    yAxLab = newScales.yAxLab;

    // plot on new scale
    xScale.range([0,canvas_width]);
    yScale.range([canvas_height,0]);
    drawAxes(xScale,yScale,timeCode);

    update();

  })
    )
    // .on("input", )

  

//  PATIENT CHECK BOXES
d3.selectAll(".pt_cb").on("change", function(){
    // the value of the checkbox is the patient index
    var this_patient = Number(this.value);
      // only do something if we're checking a box
      if(this.checked){
        // reset to the patient we just checked
        resetPatientToOne(this_patient);
      }    

})

//  HERE ARE THE MINOR COLOR CODE CHECKBOXES
    d3.select("#szType").selectAll(".sz_cb").on("change", function () {
    var this_sz = this.value;

    if (this.checked) { // adding data points
      if (burstOn) { // if we just moved here from the burst option
        d3.select("#szType").selectAll(".sz_cb").property("checked",true)
      }
      var new_sz = seizurePlot.filter(function(sz){
          return sz['type'] == this_sz;
      });
      filtered_seizurePlot = filtered_seizurePlot.concat(new_sz);
        }
    else {
      filtered_seizurePlot = filtered_seizurePlot.filter(function(sz){
        return sz['type'] != this_sz;
      });
      }
    //  turn off the burst option & update plot
    burstOn = 0;
    d3.select("#szBurst").selectAll(".sz_cb").property("checked",false)
    update();
  });

  d3.select("#szBurst").selectAll(".sz_cb").on("change", function () {
    var this_sz = this.value;

    if (this.checked) { // adding data points 
      if (!burstOn) { // if we just moved here from sz types
        d3.select("#szBurst").selectAll(".sz_cb").property("checked",true)
      }
      var new_sz = seizurePlot.filter(function(sz){
          return sz['burst'] == this_sz;
      });
      filtered_seizurePlot = filtered_seizurePlot.concat(new_sz);
        }
    else {
      filtered_seizurePlot = filtered_seizurePlot.filter(function(sz){
        return sz['burst'] != this_sz;
      });
      }
    //  turn on the burst option & update plot
    burstOn = 1;
    d3.select("#szType").selectAll(".sz_cb").property("checked",false);
    update()
  });

//  This function restores the plot to default settings & plots patient no of index
function resetPatientToOne(index){
      // turn off all the other boxes except the one we want
      d3.selectAll(".pt_cb").property("checked",false);
      d3.selectAll(".pt_cb")[0][index].checked=true;
      if (burstOn) {
        d3.select("#szBurst").selectAll(".sz_cb").property("checked",true)
      } else {
        d3.select("#szType").selectAll(".sz_cb").property("checked",true)
      }      

      seizurePlot = allPatients[index].seizures;
      // Removing the first seizure (which I set to interval = 0)
      seizurePlot = seizurePlot.slice(1,-1)
      filtered_seizurePlot = seizurePlot.map(function(d) { return d; });

      if (timeCode == 0){
        zoomMax = d3.max(seizurePlot,function(d){return d.time;});
      } else if (timeCode == 1 | timeCode == 2 | timeCode == 3){
         zoomMax = d3.max(seizurePlot,function(d){return d.time / 28;});
      } else if (timeCode == 4 | timeCode == 5){
        zoomMax = d3.max(seizurePlot,function(d){return d.time / 365;});
      }

      R1 = 0;
      R2 = zoomMax;
      d3.select("#zoomRange").selectAll('.d3-slider-range').remove();
      d3.select("#zoomRange").selectAll('.d3-slider-handle').remove();
      drawSlider(zoomMax)

      // make the new axis scale
      var newScales = scaleAxes(seizurePlot,timeCode,R1,R2);
      xScale = newScales.xScale;
      xMap = newScales.xMap;
      xAxLab = newScales.xAxLab;
      yScale = newScales.yScale;
      yMap = newScales.yMap;
      yAxLab = newScales.yAxLab;

      // plot on new scale
      xScale.range([0,canvas_width]);
      yScale.range([canvas_height,0]);
      drawAxes(xScale,yScale,timeCode);

      update();

}
// END resetPatientToOne



});