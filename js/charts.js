function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    var sampleNames = data.names;

    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
  
}
// Demographics Panel 
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var panel = d3.select("#sample-metadata");

    // Use `.html("") to clear any existing metadata
    panel.html("");

    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
    Object.entries(result).forEach(([key, value]) => {
      panel.append("h6").text(`${key}: ${value}`);
    });

  });
}

// 1. Create the buildCharts function.
function buildCharts(sample) {
  // 2. Use d3.json to load and retrieve the samples.json file 
  d3.json("samples.json").then((data) => {
    // 3. Create a variable that holds the samples array. 
   var samples = data.samples;

    // 4. Create a variable that filters the samples for the object with the desired sample number.
    var filterArray = samples.filter(sampleObject => sampleObject.id == sample);
    //  5. Create a variable that holds the first sample in the array.
    var result = filterArray[0];

    // 6. Create variables that hold the otu_ids, otu_labels, and sample_values.
    var sample_values = result.sample_values;
    var otu_ids = result.otu_ids;
    var otu_labels = result.otu_labels; 

    // 7. Create the yticks for the bar chart.
    // Hint: Get the the top 10 otu_ids and map them in descending order  
    //  so the otu_ids with the most bacteria are last. 

    

    // 8. Create the trace for the bar chart. 
   var barData = [{
            x: sample_values.slice(0, 10).reverse(),
            y: otu_ids.slice(0, 10).map(otu_id => `OTU ${otu_id}`).reverse(),
            text: otu_labels.slice(0, 10).reverse(),
            type: 'bar',
            orientation: 'h',
            marker: {
                color: 'rgb(242, 113, 102)'
            },
        }];
    // 9. Create the layout for the bar chart. 
    var barLayout = {
      title: "Top 10 Microbial Species in Belly Buttons",
      xaxis: { title: "Bacteria Sample Values" },
      yaxis: { title: "OTU IDs" }
   };
    // 10. Use Plotly to plot the data with the layout. 

   Plotly.newPlot('bar', barData, barLayout);
   // 1. Create the trace for the bubble chart.
   var bubbleData = [
    {
      x: otu_ids,
      y: sample_values,
      text: otu_labels,
      mode: "markers",
      marker: {
        color: otu_ids,
        size: sample_values,
        }
    }
 
  ];

  // 2. Create the layout for the bubble chart.
   var bubbleLayout = {
    margin: { t: 0 },
    xaxis: { title: "OTU ID" },
    hovermode: "closest",
    
   };

  // 3. Use Plotly to plot the data with the layout.
 Plotly.newPlot("bubble", bubbleData, bubbleLayout);

  // 4. Create the trace for the gauge chart.
  if (wfreq == null) {
    wfreq = 0;
}
var traceGauge = {
  domain: { x: [0, 1], y: [0, 1] },
  value: wfreq,
  type: "indicator",
  mode: "gauge",
  gauge: {
      axis: {
          range: [0, 9],
          tickmode: 'linear',
          tickfont: {
              size: 15
          }
      },
      bar: { color: 'rgba(8,29,88,0)' }, // making gauge bar transparent since a pointer is being used instead
      steps: [
          { range: [0, 1], color: 'rgb(255,255,217)' },
          { range: [1, 2], color: 'rgb(237,248,217)' },
          { range: [2, 3], color: 'rgb(199,233,180)' },
          { range: [3, 4], color: 'rgb(127,205,187)' },
          { range: [4, 5], color: 'rgb(65,182,196)' },
          { range: [5, 6], color: 'rgb(29,145,192)' },
          { range: [6, 7], color: 'rgb(34,94,168)' },
          { range: [7, 8], color: 'rgb(37,52,148)' },
          { range: [8, 9], color: 'rgb(8,29,88)' }
      ]
  }
};

// determine angle for each wfreq segment on the chart
var angle = (wfreq / 9) * 180;

// calculate end points for triangle pointer path
var degrees = 180 - angle,
  radius = .8;
var radians = degrees * Math.PI / 180;
var x = radius * Math.cos(radians);
var y = radius * Math.sin(radians);

// Path: to create needle shape (triangle). Initial coordinates of two of the triangle corners plus the third calculated end tip that points to the appropriate segment on the gauge 
// M aX aY L bX bY L cX cY Z
var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
  cX = String(x),
  cY = String(y),
  pathEnd = ' Z';
var path = mainPath + cX + " " + cY + pathEnd;

gaugeColors = ['rgb(8,29,88)', 'rgb(37,52,148)', 'rgb(34,94,168)', 'rgb(29,145,192)', 'rgb(65,182,196)', 'rgb(127,205,187)', 'rgb(199,233,180)', 'rgb(237,248,217)', 'rgb(255,255,217)', 'white']

// create a trace to draw the circle where the needle is centered
var traceNeedleCenter = {
  type: 'scatter',
  showlegend: false,
  x: [0],
  y: [0],
  marker: { size: 35, color: '850000' },
  name: wfreq,
  hoverinfo: 'name'
};

// create a data array from the two traces
var gaugeData = [traceGauge, traceNeedleCenter];
    
  
  // 5. Create the layout for the gauge chart.
  var gaugeLayout = { 
      shapes:[{
          type: 'path',
          path: path,
          fillcolor: '#2F6497',
          line: {
            color: '#2F6497'
          }
        }],
  
      title: '<b>Belly Button Washing Frequency</b> <br> <b>Scrub Per Week</b>',
      height: 550,
      width: 550,
      xaxis: {zeroline:false, showticklabels:false,
                 showgrid: false, range: [-1, 1]},
      yaxis: {zeroline:false, showticklabels:false,
                 showgrid: false, range: [-1, 1]},
    };


  // 6. Use Plotly to plot the gauge data and layout.
  Plotly.newPlot(gaugeData, gaugeLayout);

  });
  
}




  
