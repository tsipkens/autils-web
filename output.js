//== PLOT ================================================//
var logn = function (mu, sg, x) {
    var p = [];
    for (var ii = 0; ii < x.length; ii++) {
        p.push(Math.exp(-1 / 2 * ((Math.log(x[ii]) - Math.log(mu)) / Math.log(sg)) ** 2));
    }
    return p
}

var logspace = function (v1, v2, n) {
    v1 = Math.log(v1);
    v2 = Math.log(v2);
    var arr = [];
    var step = (v2 - v1) / (n - 1);
    for (var ii = 0; ii < n; ii++) {
        arr.push(Math.exp(v1 + (step * ii)));
    }
    return arr;
}

var dmin = 5;
var dmax = 2e3;
var d_vec = logspace(dmin, dmax, 225);

// Define color scheme.
var colors = ["#2525C6", "#1264B2", "#222222", "#B2325A"];
var lcolors = ["", "rgba(18, 100, 178, 0.03)", "", "rgba(178, 50, 90, 0.03)"]

var $container = $('#my_dataviz'),
    width_a = 0.95 * Math.min($container.width(), 870),
    height_a = $container.height()


// set the dimensions and margins of the graph
var margin = {
        top: 0,
        right: 65,
        bottom: 50,
        left: 65
    },
    width = width_a - margin.left - margin.right,
    height = 350 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// Add X axis
var x = d3.scaleLog()
    .domain([dmin, dmax])
    .range([0, width]);
var xAxis = svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .attr("class", "axis")
    .call(d3.axisBottom(x).ticks(3).tickFormat(x => `${x.toFixed(0)}`));

// Add Y axis
var yMax = 1.05,
    yMin = 0;

var y = d3.scaleLinear()
    .domain([yMin, yMax])
    .range([height, 0]);
var yAxis = svg.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(y).ticks(5));

//-- Add axis labels --//
// Add X axis label:
svg.append("text")
    .attr("text-anchor", "middle")
    .attr('x', width / 2)
    .attr('y', height + 35)
    .attr("class", "legend-label")
    .text("Mobility diameter [nm]");

// Y axis label:
svg.append("text")
    .attr("text-anchor", "middle")
    .attr("class", "legend-label")
    .attr('transform', 'translate(-40,' + height / 2 + ')rotate(-90)')
    .text("Normalized distribution")

// Add a clipPath: everything out of this area won't be drawn.
var clip = svg.append("defs").append("svg:clipPath")
    .attr("id", "clip")
    .append("svg:rect")
    .attr("width", width)
    .attr("height", height)
    .attr("x", 0)
    .attr("y", 0);

// Generate plot.
var data = [];
for (ii = 0; ii < d_vec.length; ii++) {
    data.push({
        x: d_vec[ii],
        n: 0,
        m: 0
    })
}

svg.append('path')
    .datum(data)
    .attr("id", "area-n")
    .attr("d", d3.area()
        .x(function (d) {
            return x(d.x)
        })
        .y1(function (d) {
            return y(d.n)
        })
        .y0(0))
    .attr('stroke', colors[1])
    .attr("stroke-width", 2)
    .attr('fill', lcolors[1]);
svg.append('path')
    .datum(data)
    .attr("id", "area-m")
    .attr("d", d3.area()
        .x(function (d) {
            return x(d.x)
        })
        .y1(function (d) {
            return y(d.m)
        })
        .y0(0))
    .attr('stroke', colors[3])
    .attr("stroke-width", 2)
    .attr('fill', lcolors[3]);

var plotter = function (dg, mg, sg) {
    var p_vec = logn(dg, sg, d_vec) // number pdf
    var pm_vec = logn(mg, sg, d_vec) // mass pdf

    // Update data.
    var data = [];
    for (ii = 0; ii < d_vec.length; ii++) {
        data.push({
            x: d_vec[ii],
            n: p_vec[ii],
            m: pm_vec[ii]
        })
    }

    // Update plot.
    // prepare a helper function
    var curveFunc = d3.area()
        .x(function (d) {
            return x(d.x)
        }) // Position of both line breaks on the X axis
        .y1(function (d) {
            return y(d.n)
        }) // Y position of top line breaks
        .y0(0) // Y position of bottom line breaks (0 = bottom of svg area)


    d3.select("#area-n")
        .datum(data)
        .transition()
        .attr("d", d3.area()
            .x(function (d) {
                return x(d.x)
            })
            .y1(function (d) {
                return y(d.n)
            })
            .y0(y(0))
        )
    d3.select("#area-m")
        .datum(data)
        .transition()
        .attr("d", d3.area()
            .x(function (d) {
                return x(d.x)
            })
            .y1(function (d) {
                return y(d.m)
            })
            .y0(y(0))
        )
}


//---------------------------------------------//
// Display properties.
var updater = function () {
    var dm = Number(document.getElementById("dm-val").value);
    var rho100 = Number(document.getElementById("rho100-val").value);
    var zet = Number(document.getElementById("zet-val").value);
    var chi = Number(document.getElementById("chi-val").value);

    var prop = massmob(zet, rho100, 'rho100');
    var m = dm2mp(dm, prop) * 1e18;
    var rh = rho(dm * 1e-9, m * 1e-18);
    var C = Cc(dm * 1e-9);

    document.getElementById("m0-val").innerHTML = (prop['m0'] * 1e18).toPrecision(3);
    document.getElementById("m100-val").innerHTML = (prop['m100'] * 1e18).toPrecision(3)
    document.getElementById("rho100-valo").innerHTML = Math.round(rho100);

    var dve = dm2dve(dm, rh, true, chi)
    var dves = dm2dve(dm, rh, false, chi)
    var da = dm2da(dm, rh, true, chi, dve)
    var das = dm2da(dm, rh, false, chi, dves)

    document.getElementById("m-val").innerHTML = m.toPrecision(3);
    document.getElementById("rho-val").innerHTML = Math.round(rh);
    document.getElementById("Cc-val").innerHTML = C.toPrecision(3);
    document.getElementById("Cca-val").innerHTML = Cc(da * 1e-9).toPrecision(3);
    document.getElementById("dve-val").innerHTML = dve.toPrecision(4);
    document.getElementById("dves-val").innerHTML = dves.toPrecision(4);
    document.getElementById("da-val").innerHTML = da.toPrecision(4);
    document.getElementById("das-val").innerHTML = das.toPrecision(4);

    sg = Number(document.getElementById("sg-val").value);

    mmd = hc(dm, sg, prop['zet']);
    mm = dm2mp(mmd, prop) * 1e18;
    rhm = rho(mmd * 1e-9, mm * 1e-18);
    mmved = dm2dve(mmd, rhm, true, chi);;
    mmad = dm2da(mmd, rhm, true, chi, mmved);
    document.getElementById("cmd-val").innerHTML = dm;
    document.getElementById("mmd-val").innerHTML = mmd.toPrecision(4);
    document.getElementById("cmad-val").innerHTML = da.toPrecision(4);
    document.getElementById("mmad-val").innerHTML = mmad.toPrecision(4);

    plotter(dm, mmd, sg); // update plot
}
updater(); // run the first time