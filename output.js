
//---------------------------------------------//
// Display properties.
var updater = function() {
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
}
updater();  // run the first time
