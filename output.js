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

var linspace = function (v1, v2, n) {
    var arr = [];
    var step = (v2 - v1) / (n - 1);
    for (var ii = 0; ii < n; ii++) {
        arr.push(v1 + (step * ii));
    }
    return arr;
}

var format10 = function (no, pr) {
    var no10 = Math.log10(no)
    no10 = Math.floor(no10)
    if (Math.abs(no10) > (pr - 1)) {
        var pre = no / (10 ** no10)
        var html = pre.toPrecision(pr) + "×10<sup>" + no10.toString() + "</sup>"
    } else {
        var html = no.toPrecision(pr)
    }
    return html
}

var dmin = 5;
var dmax = 2e3;
var d_vec = logspace(dmin, dmax, 225);

// Define color scheme.
var colors = ["#2525C6", "#1264B2", "#222222", "#B2325A"];
var lcolors = ["", "rgba(18, 100, 178, 0.03)", "", "rgba(178, 50, 90, 0.03)"]

var $container = $('#my_dataviz'),
    width_a = 0.98 * Math.min($container.width(), 1000),
    height_a = $container.height()


// set the dimensions and margins of the graph
var margin = {
        top: 0,
        right: 15,
        bottom: 150,
        left: 4
    },
    width = width_a - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


// Add X scale
var x = d3.scaleLog()
    .domain([dmin, dmax])
    .range([0, width]);

// Add Y scale
var yMax = 1.1,
    yMin = 0;

var y = d3.scaleLinear()
    .domain([yMin, yMax])
    .range([height, 0]);

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

svg.append("line")
    .attr("id", "cmd-line")
    .attr("x1", x(dmin))
    .attr("y1", y(yMin))
    .attr("x2", x(dmin))
    .attr("y2", y(yMax))
    .style("stroke-width", 1.5)
    .style("stroke-dasharray", ("3, 3"))
    .style("stroke", colors[1])
    .style("fill", "none");
svg.append("line")
    .attr("id", "mmd-line")
    .attr("x1", x(dmin))
    .attr("y1", y(yMin))
    .attr("x2", x(dmin))
    .attr("y2", y(yMax))
    .style("stroke-width", 1.5)
    .style("stroke-dasharray", ("3, 3"))
    .style("stroke", colors[3])
    .style("fill", "none");
svg.append("text")
    .attr("id", "cmd-label")
    .attr("text-anchor", "middle")
    .attr("class", "legend-label")
    .attr("x", x(75))
    .attr("y", y(1.05))
    .text("0")
svg.append("text")
    .attr("id", "mmd-label")
    .attr("text-anchor", "middle")
    .attr("class", "legend-label")
    .attr("x", x(75))
    .attr("y", y(1.05))
    .text("0")

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
    .attr("stroke-width", 1.5)
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
    .attr("stroke-width", 1.5)
    .attr('fill', lcolors[3]);

var xValues = [5, 10, 20, 50, 100, 200, 500, 1000, 2000]
var xAxis = svg.append("g")
    .attr("transform", "translate(0," + height + ")")
    .attr("class", "axis")
    .call(d3.axisBottom(x)
        .tickValues(xValues)
        .tickFormat((d, i) => xValues[i]))

var daValues = [0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000]
var dm2daValues = [0.5, 1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000]
var xAxis2 = svg.append("g")
    .attr("transform", "translate(0," + (height + 55) + ")")
    .attr("class", "axis")
    .attr("id", "da-axis")
    .call(d3.axisBottom(x)
        .tickValues(dm2daValues)
        .tickFormat((d, i) => daValues[i]));

var mpValues = [1e-4, 1e-3, 1e-2, 0.1, 1, 10, 100, 1000]
var dm2mpValues = [1e-4, 1e-3, 1e-2, 0.1, 1, 10, 100, 1000]
var xAxis2 = svg.append("g")
    .attr("transform", "translate(0," + (height + 110) + ")")
    .attr("class", "axis")
    .attr("id", "mp-axis")
    .call(d3.axisBottom(x)
        .tickValues(dm2mpValues)
        .tickFormat((d, i) => mpValues[i]));

//-- Add axis labels --//
// Add X axis label:
svg.append("text")
    .attr("text-anchor", "middle")
    .attr('x', width / 2)
    .attr('y', height + 32)
    .attr("class", "legend-label")
    .text("Mobility diameter [nm]");
svg.append("text")
    .attr("text-anchor", "middle")
    .attr('x', width / 2)
    .attr('y', height + 87)
    .attr("class", "legend-label")
    .text("Aerodynamic diameter [nm]");
svg.append("text")
    .attr("text-anchor", "middle")
    .attr('x', width / 2)
    .attr('y', height + 142)
    .attr("class", "legend-label")
    .text("Single particle mass, mp [fg]");

// Add circles marking the median on axes.
svg.append("circle")
    .attr("r", 3)
    .attr("cx", function(d) { return x(5); })
    .attr("cy", function(d) { return height; })
    .attr('fill', colors[3])
    .attr('stroke', "black")
    .attr("stroke-width", 0.5)
    .attr("id", "mmd-circ")
svg.append("circle")
    .attr("r", 3)
    .attr("cx", function(d) { return x(5); })
    .attr("cy", function(d) { return height; })
    .attr('fill', colors[1])
    .attr('stroke', "black")
    .attr("stroke-width", 0.5)
    .attr("id", "cmd-circ")

svg.append("circle")
    .attr("r", 3)
    .attr("cx", function(d) { return x(5); })
    .attr("cy", function(d) { return height + 55; })
    .attr('fill', colors[3])
    .attr('stroke', "black")
    .attr("stroke-width", 0.5)
    .attr("id", "mmad-circ")

svg.append("circle")
    .attr("r", 3)
    .attr("cx", function(d) { return x(5); })
    .attr("cy", function(d) { return height + 55; })
    .attr('fill', colors[1])
    .attr('stroke', "black")
    .attr("stroke-width", 0.5)
    .attr("id", "cmad-circ")
svg.append("circle")
    .attr("r", 3)
    .attr("cx", function(d) { return x(5); })
    .attr("cy", function(d) { return height + 110; })
    .attr('fill', colors[3])
    .attr('stroke', "black")
    .attr("stroke-width", 0.5)
    .attr("id", "mmm-circ")
svg.append("circle")
    .attr("r", 3)
    .attr("cx", function(d) { return x(5); })
    .attr("cy", function(d) { return height + 110; })
    .attr('fill', colors[1])
    .attr('stroke', "black")
    .attr("stroke-width", 0.5)
    .attr("id", "cmm-circ")

var plotter = function (dg, mg, sg, prop, chi) {
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

    d3.select("#cmd-line")
        .transition()
        .attr("x1", x(dg))
        .attr("y1", y(yMin))
        .attr("x2", x(dg))
        .attr("y2", y(1 * 1.01))
    d3.select("#mmd-line")
        .transition()
        .attr("x1", x(mg))
        .attr("y1", y(yMin))
        .attr("x2", x(mg))
        .attr("y2", y(1 * 1.01))
    svg.select("#cmd-label")
        .transition()
        .attr("x", x(dg))
        .attr("y", y(1.03))
        .attr("font-size", "10pt")
        .text(dg.toFixed())
    svg.select("#mmd-label")
        .transition()
        .attr("x", x(mg))
        .attr("y", y(1.03))
        .attr("font-size", "10pt")
        .text(mg.toFixed())
    
    // Move circles marking the median on axes.
    svg.select("#cmd-circ")
        .transition()
        .attr("cx", x(dg))
    svg.select("#mmd-circ")
        .transition()
        .attr("cx", x(mg))
    svg.select("#cmad-circ")
        .transition()
        .attr("cx", x(dg))
    svg.select("#mmad-circ")
        .transition()
        .attr("cx", x(mg))
    svg.select("#cmm-circ")
        .transition()
        .attr("cx", x(dg))
    svg.select("#mmm-circ")
        .transition()
        .attr("cx", x(mg))
    
    //-- Update aerodynamic diameter axis --------------------//
    for (var ii = 0; ii < daValues.length; ii++) {
        var daVal = daValues[ii]
        dm2daValues[ii] = da2dm(daVal, [], true, chi, prop)

        // Remove entries out of the domain.
        if ((dm2daValues[ii] < xValues[0]) || (dm2daValues[ii] > xValues[xValues.length - 1])) {
            dm2daValues[ii] = 1e-10  // move far to the left (will not show)
        }
    }
    svg.select("#da-axis")
        .transition()
        .call(d3.axisBottom(x)
            .tickValues(dm2daValues)
            .tickFormat((d, i) => daValues[i]))

    //-- Update single particle mass axis --------------------//
    for (var ii = 0; ii < mpValues.length; ii++) {
        var mpVal = mpValues[ii]
        dm2mpValues[ii] = mp2dm(mpVal * 1e-18, prop)

        // Remove entries out of the domain.
        if ((dm2mpValues[ii] < xValues[0]) || (dm2mpValues[ii] > xValues[xValues.length - 1])) {
            dm2mpValues[ii] = 1e-10  // move far to the left (will not show)
        }
    }
    svg.select("#mp-axis")
        .transition()
        .call(d3.axisBottom(x)
            .tickValues(dm2mpValues)
            .tickFormat((d, i) => mpValues[i]))
    //-------------------------------------------------------//

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
    var T = Number(document.getElementById("T-val").value)
    var patm = Number(document.getElementById("p-val").value)
    var p = patm * 101325

    var gas = document.getElementById("gas-val").value
    gasProp = gases[0][gas]
    console.log(gasProp)

    var mu = viscosity(T, p, gasProp)
    var lam = mfp(T, p, gasProp)
    document.getElementById("mu-val").innerHTML = format10(mu, 3)
    document.getElementById("lam-val").innerHTML = format10(lam, 3)

    var dm = Number(document.getElementById("dm-val").value)
    var rho100 = Number(document.getElementById("rho100-val").value)
    var zet = Number(document.getElementById("zet-val").value)
    var chi = Number(document.getElementById("chi-val").value)
    var Kn = Knudsen(lam, dm)

    var prop = massMob(zet, rho100, 'rho100')
    var m = dm2mp(dm, prop) * 1e18
    var rh = rho(dm * 1e-9, m * 1e-18)
    var C = Cc(dm * 1e-9, T, p, gasProp);
    
    document.getElementById("Kn-val").innerHTML = format10(Kn, 3)
    document.getElementById("m0-val").innerHTML = format10(prop['m0'] * 1e18, 3)
    document.getElementById("m100-val").innerHTML = (prop['m100'] * 1e18).toPrecision(3)
    document.getElementById("rho100-valo").innerHTML = Math.round(rho100)
    
    var dve = dm2dve(dm, rh, true, chi)
    var dves = dm2dve(dm, rh, false, chi)
    var da = dm2da(dm, rh, true, chi, dve)
    var das = dm2da(dm, rh, false, chi, dves)
    var Ca = Cc(da * 1e-9, T, p, gasProp)
    var B = dm2B(dm)
    var Zp = dm2Zp(dm)
    var D = dm2D(dm)

    document.getElementById("m-val").innerHTML = format10(m, 3);
    document.getElementById("rho-val").innerHTML = Math.round(rh);
    document.getElementById("Cc-val").innerHTML = C.toPrecision(3);
    document.getElementById("Cca-val").innerHTML = Ca.toPrecision(3);
    document.getElementById("dve-val").innerHTML = dve.toPrecision(3);
    document.getElementById("dves-val").innerHTML = dves.toPrecision(3);
    document.getElementById("da-val").innerHTML = da.toPrecision(3);
    document.getElementById("das-val").innerHTML = das.toPrecision(3);
    document.getElementById("B-val").innerHTML = format10(B, 3);
    document.getElementById("Zp-val").innerHTML = format10(Zp, 3);
    document.getElementById("D-val").innerHTML = format10(D, 3);

    sg = Number(document.getElementById("sg-val").value);
    cmd = Number(document.getElementById("cmd-val").value);
    var mCmd = dm2mp(cmd, prop) * 1e18
    var rhCmd = rho(cmd * 1e-9, mCmd * 1e-18)
    var cmved = dm2dve(cmd, rhCmd, false, chi)

    var cmad = dm2da(cmd, rhCmd, true, chi, cmved)
    var mmd = hc(cmd, sg, prop['zet']);
    var mm = dm2mp(mmd, prop) * 1e18;
    var rhm = rho(mmd * 1e-9, mm * 1e-18);
    var mmved = dm2dve(mmd, rhm, true, chi);
    var mmad = dm2da(mmd, rhm, true, chi, mmved);
    var cmm = dm2mp(cmd, prop) * 1e18;
    var mmm = dm2mp(mmd, prop) * 1e18;
    var smp = sdm2smp(sg, prop);
    document.getElementById("mmd-val").innerHTML = mmd.toPrecision(4);
    document.getElementById("cmad-val").innerHTML = cmad.toPrecision(4);
    document.getElementById("mmad-val").innerHTML = mmad.toPrecision(4);
    document.getElementById("cmm-val").innerHTML = cmm.toPrecision(4);
    document.getElementById("mmm-val").innerHTML = mmm.toPrecision(4);
    document.getElementById("smp-val").innerHTML = smp.toPrecision(3);

    var sda = sdm2sda(cmd, sg, rhCmd, true, chi);
    document.getElementById("sda-val").innerHTML = sda.toPrecision(3);
        
    plotter(cmd, mmd, sg, prop, chi); // update plot

    //== AVERAGE CHARGE ==//
    var mstar = Number(document.getElementById("mstar-val").value);
    var n_interp = Number(document.getElementById("n-interp-val").value);
    var q0 = Number(document.getElementById("q0-val").value);
    var nu = Number(document.getElementById("nu-val").value);
    
    var mtr = intac(mstar, q0, nu, prop['k'], prop['zet'], n_interp)  // transmitted mass
    var qtr = mtr / mstar;  // transmitted charge
    document.getElementById("mtr-val").innerHTML = mtr.toPrecision(4);
    document.getElementById("qtr-val").innerHTML = qtr.toPrecision(4);
}
updater(); // run the first time

// For preset values of effective density and mass-mobility exponent.
var setMassMobProp = function (rho, zet) {
    document.getElementById("rho100-val").value = rho;
    document.getElementById("zet-val").value = zet;
    updater();
}
