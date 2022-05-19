
//---------------------------------------------//
// Display properties.
var updater = function() {
    dm = document.getElementById("dm-val").value;
    rho100 = document.getElementById("rho100-val").value;
    zet = Number(document.getElementById("zet-val").value);
    chi = Number(document.getElementById("chi-val").value);

    prop = massmob(zet, rho100, 'rho100');
    m = dm2mp(dm, prop) * 1e18;
    rh = rho(dm * 1e-9, m * 1e-18);
    C = Cc(dm * 1e-9);
    
    document.getElementById("m0-val").innerHTML = (prop['m0'] * 1e18).toPrecision(3);
    document.getElementById("m100-val").innerHTML = (prop['m100'] * 1e18).toPrecision(3)
    document.getElementById("rho100-valo").innerHTML = Math.round(rho100);
    
    var dve = dm2dve(dm, rh, true, chi)
    var dves = dm2dve(dm, rh, false, chi)
    var da = dm2da(dm, rh, true, chi, dve)
    var das = dm2da(dm, rh, false, chi, dves)
    
    document.getElementById("m-val").innerHTML = m.toPrecision(3);
    document.getElementById("rho-val").innerHTML = Math.round(rh);
    document.getElementById("Cc-val").innerHTML = Cc(dm * 1e-9).toPrecision(3);
    document.getElementById("Cca-val").innerHTML = Cc(da * 1e-9).toPrecision(3);
    document.getElementById("dve-val").innerHTML = dve.toPrecision(3);
    document.getElementById("dves-val").innerHTML = dves.toPrecision(3);
    document.getElementById("da-val").innerHTML = da.toPrecision(3);
    document.getElementById("das-val").innerHTML = das.toPrecision(3);
}
updater();  // run the first time
