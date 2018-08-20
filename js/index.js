(function () {
  //   let margin = {
  //   top: 20,
  //   left: 20,
  //   right: 20,
  //   bottom: 20
  // },

  var height = 900,
      // - margin.top - margin.bottom,
  width = 1500; // - margin.left - margin.right;

  var svg = d3.select("#container").append("svg").attr("width", width).attr("height", height).attr("id", "map").append("g");

  d3.queue().defer(d3.json, "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json").defer(d3.json, "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json").await(ready);

  var projection = d3.geoMercator().translate([width / 2, height / 2]).scale(200);

  var path = d3.geoPath().projection(projection);

  function ready(error, data, meteors) {

    var countries = topojson.feature(data, data.objects.countries1).features;
    meteors = meteors.features.filter(function (d) {
      return d.geometry && d.properties.mass;
    }).sort(function (a, b) {
      return b.properties.mass - a.properties.mass;
    });
    var min = +meteors[meteors.length - 1].properties.mass,
        max = +meteors[0].properties.mass;
    var scale = d3.scaleLinear().domain([min, 0.01 * max, 0.2 * max, max]).range([2, 6, 40, 60]);

    var colorScale = d3.scaleOrdinal(d3["schemeCategory20c"]);

    var tip = d3.tip().attr("class", "d3-tip").offset([-3, 0]).html(function (d) {
      var mass = +d.properties.mass;
      mass = mass.toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
      return "<div class=\"name\">" + d.properties.name + "</div><br/>" + mass + " kg<br/>" + d.properties.year.split("T")[0];
    });

    svg.selectAll(".country").data(countries).enter().append("path").attr("class", "country").attr("d", path);

    svg.selectAll(".meteor").data(meteors).enter().append("circle").classed("meteor", true).attr("r", function (d) {
      return scale(d.properties.mass);
    }).attr("cx", function (d) {
      return projection(d.geometry.coordinates)[0];
    }).attr("cy", function (d) {
      return projection(d.geometry.coordinates)[1];
    }).style("fill", function (d, i) {
      return colorScale(i);
    }).on("mouseover", tip.show).on("mouseout", tip.hide);

    svg.call(tip);
  }
})();