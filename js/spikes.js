d3.json("spikes.json", function(dataset) {

  var N = 15;
  var plot_code = 0
      col_code = 1;


// select chart areas
  var chart_area1 = d3.select("#chart_area1"),
  chart_area2 = d3.select("#chart_area2"),
  chart_area3 = d3.select("#chart_area3");

// find the properties from our chart area html
  var width = (chart_area1[0][0].offsetWidth),
  height = (chart_area1[0][0].offsetHeight),
  small_width = 150;
  

  var radius = Math.min(width, height) / 2,
  outer_radius = Math.min(width, height) / 2,
  fixed_radius = 60;


  var line_width = 5,
  fixed_line_width = 10;

  var sp_thresh1 = 0.1,
  sp_thresh2 = 0.9,
  sz_thresh1 = 0.1,
  sz_thresh2 = 0.9;

  var sp_lo = 1,
  sp_hi = 1,
  sz_lo = 1,
  sz_hi = 1;

  var pt_select = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14];
  var time = [0,1,2,3,4,5,6,7];


// var seizure_col = ['#ff5733','#ff6e4b','#ff8260','#ff9475',
// '#ffa689','#ffb69d','#ffc5b1','#ffd4c4',
// '#ffe2d8','#fff0eb','#ffffff'];

var seizure_col = ['#dc143c','#e95859','#f48477','#fbac98','#ffd2b9','#fff8dc','#e0e5d0','#c1d4c4','#a2c2b8','#81afac','#5f9ea0']

var spike_col = ['#dc143c','#e95859','#f48477','#fbac98','#ffd2b9','#fff8dc','#e0e5d0','#c1d4c4','#a2c2b8','#81afac','#5f9ea0']

// var spike_col = ['#077fea','#468bec','#6496ef',
// '#7ca3f1','#93b0f4','#a6bcf6','#bac9f8','#cbd6fa',
// '#dde4fc','#eef2fd','#ffffff'];


  var color_map_sz = d3.scale.category20b()
  .domain([1,0.9,0.8,0.7,0.6,0.5,0.4,0.2,0.3,0.1,0])
  .range(seizure_col);

  var color_map_sp = d3.scale.category20b()
  .domain([1,0.9,0.8,0.7,0.6,0.5,0.4,0.2,0.3,0.1,0])
  .range(spike_col);


// colors I am using
var gray = 'black';
var green = '#00A9F8';
var red = '#F84F00';
var font_col = 'white';
var stroke_col = 'white';

  var sp_chart = chart_area1
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .append('g')
  .attr('transform', 'translate(' + (width / 2) +  ',' + (height / 2) + ')');

 var sz_chart = chart_area2
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .append('g')
  .attr('transform', 'translate(' + (width / 2) +  ',' + (height / 2) + ')');

 
var pt_chart = [];

for (i=0;i<N;i++){
  var temp = d3.select("#pt" + (i + 1))
                .append('svg')
                .attr('width',small_width)
                .attr('height',small_width)
                .append('g')
                .attr('transform', 'translate(' + (small_width/2) +  ',' + (small_width/2) + ')');

  pt_chart.push(temp)
}

//  TIME LABELS
//  aka most annoying thing in the world
var label_height = 120,
    label_width = 110,
    tick_length = 10;

//  midnight
sp_chart.append('line')
        .attr('y1',-label_height)
        .attr('y2',-(label_height-tick_length))
        .style('stroke','white');

sp_chart.append('text')
        .attr('dy',-(label_height-30))
        .style('text-anchor', 'middle')
        .text('Midnight')
        .style('fill','white')
        .style('font-size',12);

//  midday
sp_chart.append('line')
        .attr('y1',label_height)
        .attr('y2',(label_height-tick_length))
        .style('stroke','white');

sp_chart.append('text')
        .attr('dy',(label_height-30))
        .style('text-anchor', 'middle')
        .text('Midday')
        .style('fill','white')
        .style('font-size',12);
       
 //  6 am
sp_chart.append('line')
        .attr('x1',label_width)
        .attr('x2',label_width+tick_length)
        .attr('stroke','white')

sp_chart.append('text')
        .attr('dx',(label_width-30))
        .attr('dy',3)
        .style('text-anchor', 'middle')
        .text('6 am')
        .style('fill','white')
        .style('font-size',12);

//  6 pm
sp_chart.append('line')
        .attr('x1',-label_width)
        .attr('x2',-(label_width+tick_length))
        .attr('stroke','white')

sp_chart.append('text')
        .attr('dx',-(label_width-30))
        .attr('dy',3)
        .style('text-anchor', 'middle')
        .text('6 pm')
        .style('fill','white')
        .style('font-size',12);


//  PIE CHARTS
var pie = d3.layout.pie()
.value(function(d){ return 4}) // all segments are 4%
.sort(null);


//  TYPE 0
var sp_arc = [];
var sp_path = [];
var sz_arc = [];
var sz_path = [];
var rad10 = radius;
var rad20 = radius-line_width;

//  TYPE 1
var pt_arc_sp = [];
var pt_path_sp = [];
var pt_arc_sz = [];
var pt_path_sz = [];
var rad11 = fixed_radius;
var rad21 = fixed_radius - fixed_line_width;

// loop through the patients
for (i=0; i<N; i++){

  // set the pie
  var next_patient0 = d3.svg.arc()
  .outerRadius(rad10)
  .innerRadius(rad20);

  var next_patient1_sp = d3.svg.arc()
  .outerRadius(rad11)
  .innerRadius(rad21);

  var next_patient1_sz = d3.svg.arc()
  .outerRadius(rad21)
  .innerRadius(rad21 - fixed_line_width);

  // add to array
  sp_arc.push(next_patient0);
  sz_arc.push(next_patient0);
  pt_arc_sp.push(next_patient1_sp);
  pt_arc_sz.push(next_patient1_sz);

  // update radii
  rad10 = rad20;
  rad20 = rad20-line_width;

  // get pt sp data
  var patient_data = dataset[i]

  var next_pie = sp_chart.selectAll('path')
  .data(pie(patient_data.spikes))

  //add to array
  sp_path.push(next_pie);

  // get pt sz data
  var next_pie = sz_chart.selectAll('path')
  .data(pie(patient_data.seizures));

  //add to array
  sz_path.push(next_pie);

  //
  var next_pie = pt_chart[i].selectAll('path')
  .data(pie(patient_data.seizures));

  pt_path_sz.push(next_pie);

  var next_pie = pt_chart[i].selectAll('path')
  .data(pie(patient_data.spikes));

  pt_path_sp.push(next_pie);

}

// SLIDER CONTORLS
var last_value = 1;
circ_plots = d3.select("#p1")
circ_plots.style("display","block")
            .style("visibility","visible");
// PT CIRCADIAN
d3.select("#pt-slider").on("change", function () {
  var pt = this.value
  var pt_label = 'Patient ' + pt
  var pt_id = '#p' + pt
  var pt_id_prev = '#p' + last_value
  last_value = pt;

  d3.select("#pt-slider_text").text(pt_label)

  circ_plots = d3.select(pt_id_prev)
  circ_plots.style("display","none")
            .style("visibility","hidden");
  circ_plots = d3.select(pt_id)
  circ_plots.style("display","block")
            .style("visibility","visible");
  // circ_plots.style("display","block")

});

// SPIKES
  d3.select("#spike_slider1").on("input", function () {
    d3.select('#spike_slider1_text').text(['< ' + this.value + '%'])
    sp_thresh1 = parseInt(this.value)/100
    update(sp_thresh1,sp_thresh2,sp_lo,sp_hi,sz_thresh1,sz_thresh2,sz_lo,sz_hi);
    });

  d3.select("#spike_slider2").on("input", function () {
    d3.select('#spike_slider2_text').text(['> ' + this.value + '%'])
    sp_thresh2 = parseInt(this.value)/100
    update(sp_thresh1,sp_thresh2,sp_lo,sp_hi,sz_thresh1,sz_thresh2,sz_lo,sz_hi);
    });

//  SEIZURES
    d3.select("#sz_slider1").on("input", function () {
    d3.select('#sz_slider1_text').text(['< ' + this.value + '%'])
    sz_thresh1 = parseInt(this.value)/100
    update(sp_thresh1,sp_thresh2,sp_lo,sp_hi,sz_thresh1,sz_thresh2,sz_lo,sz_hi);
    });

  d3.select("#sz_slider2").on("input", function () {
    d3.select('#sz_slider2_text').text(['> ' + this.value + '%'])
    sz_thresh2 = parseInt(this.value)/100
    update(sp_thresh1,sp_thresh2,sp_lo,sp_hi,sz_thresh1,sz_thresh2,sz_lo,sz_hi);
    });
  // ~~~~~~~~~~~~~ END SLIDER CONTROLS

// CHECK BOX CONTROLS

// PLOT
// Big Plots - 0
d3.select("#plot0").on("change",function(){
  if (this.checked){
    plot_code = 0;
    d3.select("#plot1").property("checked",false)
    d3.select("#chart_area1").style("display","block")
    d3.select("#chart_area2").style("display","block")
    d3.select("#chart_area3").style("display","none")
    d3.selectAll(".plot0show").style("display","block")
  } else {
    plot_code = 1;
    d3.select("#plot1").property("checked",true)
    d3.select("#chart_area1").style("display","none")
    d3.select("#chart_area2").style("display","none")
    d3.select("#chart_area3").style("display","block")
    d3.selectAll(".plot0show").style("display","none")
  }
})

// Small Plots - 1
d3.select("#plot1").on("change",function(){
  if (this.checked){
    plot_code = 1;
    d3.select("#plot0").property("checked",false)
    d3.select("#chart_area1").style("display","none")
    d3.select("#chart_area2").style("display","none")
    d3.select("#chart_area3").style("display","block")
    d3.selectAll(".plot0show").style("display","none")
  } else {
    plot_code = 0;
    d3.select("#plot0").property("checked",true)
    d3.select("#chart_area1").style("display","block")
    d3.select("#chart_area2").style("display","block")
    d3.select("#chart_area3").style("display","none")
    d3.selectAll(".plot0show").style("display","block")
  }
})

//  SPIKES
  d3.select("#low_spikes").on("change", function(){
    if (this.checked) {
      sp_lo = 1;
    } else {
      sp_lo = 0;
    }
    update(sp_thresh1,sp_thresh2,sp_lo,sp_hi,sz_thresh1,sz_thresh2,sz_lo,sz_hi);
  });

  d3.select("#hi_spikes").on("change", function(){
    if (this.checked) {
      sp_hi = 1;
    } else {
      sp_hi = 0;
    }
    update(sp_thresh1,sp_thresh2,sp_lo,sp_hi,sz_thresh1,sz_thresh2,sz_lo,sz_hi);
  });

 //  SEIZURES
    d3.select("#low_sz").on("change", function(){
    if (this.checked) {
      sz_lo = 1;
    } else {
      sz_lo = 0;
    }
    update(sp_thresh1,sp_thresh2,sp_lo,sp_hi,sz_thresh1,sz_thresh2,sz_lo,sz_hi);
  });

  d3.select("#hi_sz").on("change", function(){
    if (this.checked) {
      sz_hi = 1;
    } else {
      sz_hi = 0;
    }
    update(sp_thresh1,sp_thresh2,sp_lo,sp_hi,sz_thresh1,sz_thresh2,sz_lo,sz_hi);
  });

  // PATIENTS
  
// ~~~~~~~~~~~~~~ END CHECKBOX CONTROLS

  // draw initial plot
  update(sp_thresh1,sp_thresh2,sp_lo,sp_hi,sz_thresh1,sz_thresh2,sz_lo,sz_hi);

// update data function
function update(thresh1,thresh2,on1,on2,thresh3,thresh4,on3,on4){

  for (i=0;i<N;i++){
      var path10 = sp_path[i],
      path11 = pt_path_sp[i];
      var data = dataset[i];
      data1 = data.spikes;

      var path20 = sz_path[i],
      path21 = pt_path_sz[i];
      data2 = data.seizures;
      norm_vals = normalize(data2);

      for (j=0;j<24;j++){
        data2[j].value = norm_vals[j]
      }

  // SPIKES

  if (col_code==0){

          // enter arcs
          path1.enter().append('path')
            .attr('d', sp_arc[i])
            .attr('stroke',gray)
            .attr('fill', function(d, i) {
            if (d.data.value <= thresh1 && on1==1){
              return green;
            } else if (d.data.value >= thresh2 && on2==1){
              return red;
            }
            else {
              return gray;
            } })

          // transition colors
          path1.transition().duration(10)
             .attr('fill', function(d, i) {
            if (d.data.value <= thresh1 && on1==1){
              return green;
            } else if (d.data.value >= thresh2 && on2==1){
              return red;
            }
            else {
              return gray;
            } 
          });


  //  SEIZURES

      // enter arcs
      path2.enter().append('path')
        .attr('d', sz_arc[i])
        .attr('stroke',gray)
        .attr('fill', function(d, i) {
        if (d.data.value <= thresh3 && on3==1){
          return green;
        } else if (d.data.value >= thresh4 && on4==1){
          return red;
        }
        else {
          return gray;
        } })

      // transition colors
      path2.transition().duration(10)
         .attr('fill', function(d, i) {
        if (d.data.value <= thresh3 && on3==1){
          return green;
        } else if (d.data.value >= thresh4 && on4==1){
          return red;
        }
        else {
          return gray;
        } 
      });

  } // end if col_code = 0

  if (col_code==1){
              // enter arcs
          path10.enter().append('path')
            .attr('d', sp_arc[i])
            .attr('stroke',function(d) {
              var rounded = Math.round( d.data.value * 10 ) / 10;
              return color_map_sp(rounded) 
            })
            .attr('fill', function(d, i) {
              var rounded = Math.round( d.data.value * 10 ) / 10;
              return color_map_sp(rounded)
           })

          // enter arcs
          path20.enter().append('path')
            .attr('d', sz_arc[i])
            .attr('stroke',function(d) {
              var rounded = Math.round( d.data.value * 10 ) / 10;
              return color_map_sz(rounded) 
            })
            .attr('fill', function(d, i) {
              var rounded = Math.round( d.data.value * 10 ) / 10;
              return color_map_sz(rounded)
           })

          // enter arcs
          path11.enter().append('path')
            .attr('d', pt_arc_sp[i])
            // .attr('stroke','black')
            // .attr('fill','black')
            .attr('stroke',function(d) {
              var rounded = Math.round( d.data.value * 10 ) / 10;
              return color_map_sp(rounded) 
            })
            .attr('fill', function(d, i) {
              var rounded = Math.round( d.data.value * 10 ) / 10;
              return color_map_sp(rounded)
           })

          // enter arcs
          path21.enter().append('path')
            .attr('d', pt_arc_sz[i])
            // .attr('stroke','black')
            // .attr('stroke','black')
            .attr('stroke',function(d) {
              var rounded = Math.round( d.data.value * 10 ) / 10;
              return color_map_sz(rounded) 
            })
            .attr('fill', function(d, i) {
              var rounded = Math.round( d.data.value * 10 ) / 10;
              return color_map_sz(rounded)
           })
  } // end if col_code = 1

  } //end for
    

} //end update

function initialize_paths(type){

  if (type == 0) {

  } else if (type == 1) {


  }

}

function normalize(data){

  var min = Infinity;
  var max = -Infinity;
  var new_data = [];
  
  for (j=0;j<24;j++){     
     temp = data[j].value; 
     new_data.push(temp);
    if (temp > max){
        max = temp;
      } else if (temp < min){
        min = temp;
      }
    }

    var out = [];
    var ran = max-min;

    for (j=0;j<24;j++){
      out.push((new_data[j] - min) / ran)
    }
    return out;
}


}); // end d3.json