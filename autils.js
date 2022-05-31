const pi = 3.14159265359
const e = 1.60217733e-19
const kB = 1.380658e-23

var viscosity = function (T, p, gasProp) {
    return gasProp["mu_ref"] * (gasProp["Tref"] + gasProp["S"]) / (T + gasProp["S"]) * (T / gasProp["Tref"]) ** 1.5 * 1e-7
}

var mfp = function (T, p, gasProp) {
    // Kim et al. (2005) (doi:10.6028/jres.110.005), ISO 15900 Eqn 4
    // Correct default mean free path.
    return gasProp["mfp_ref"] * 1e9 * (T / gasProp["Tref"]) * (gasProp["pref"] / p) * (1 + gasProp["S"] / gasProp["Tref"]) / (1 + gasProp["S"] / T)
}

var Knudsen = function (lam, d) {
    // lam is mean free path
    return (2 * lam) / d
}

var Cc = function (d, T = null, p = null, gasProp = null) {

    if (gasProp == null) { // For air, from Davies (1945); if (p, T not specified)
        var lam = 66.5e-9; // mean free path
        
        A1 = 1.257;
        A2 = 0.4;
        A3 = 0.55;
    } else { // Kim et al.

        lam = mfp(T, p, gasProp) * 1e-9 // mean free path (convert from nm to m)

        A1 = 1.165
        A2 = 0.483
        A3 = 0.997 / 2
    }

    Kn = Knudsen(lam, d); // Knudsen number
    return 1 + Kn * (A1 + A2 * Math.exp(-(2 * A3) / Kn)); // Cunningham slip correction factor
}

// Compute mass-mobility relation parameters. 
// Currently only works when rho100 is specified.
var massMob = function (zet, val, field = 'rho100') {
    var prop = {
        zet: zet,
        rho100: 0,
        rho0: 0,
        m100: 0,
        m0: 0
    };
    if (field == 'rho100') {
        prop['m100'] = val * pi / 6 * (100e-9) ** 3;
        prop['m0'] = prop['m100'] * (1 / 100) ** prop['zet'];
    }

    // Fill out parameters based on above.
    prop['m100'] = prop['m0'] / ((1 / 100) ** prop['zet']);
    prop['rho0'] = prop['m0'] * 6 / pi * 1e27;
    prop['rho100'] = prop['m100'] * 6 / pi / (100e-9 ** 3);
    prop['k'] = prop['m0']; // copy to k (alternative notation)

    console.log(prop);

    return prop
}

var dm2mp = function (dm, prop) {
    return prop['m0'] * dm ** prop['zet']
}

var mp2dm = function (mp, prop) {
    return (mp / prop['m0'] ) ** (1 / prop['zet'])
}

var sdm2smp = function (smp, prop) {
    return Math.exp(prop['zet'] * Math.log(smp))
}

var rho = function (dm, m) {
    return 6 * m / (pi * dm ** 3)
}

var dm2rho = function (dm, prop) {
    return rho(dm, dm2mp(dm, prop) * 1e18)
}

var dm2dve = function (dm, rho = 1800, fl = true, chi = 1) {
    var dve = dm / chi; // volume equivalent diameter
    
    if (fl) {
        var fun_ve = function (dve) {
            return ((dm / chi * Cc(dve * 1e-9) / Cc(dm * 1e-9) - dve)) ** 2
        }
        var a = optimjs.minimize_Powell(fun_ve, [dve])
        dve = a.argument[0]
    }

    return dve
}

var dm2da = function (dm, rho = 1800, fl = true, chi = 1, dve = dm2dve(dm, rho, fl, chi)) {
    var rho0 = 1e3; // density of water

    // Compute simple volume-equivalent and aerodynamic diameters, 
    // that is without iteration. 
    var da = dve * Math.sqrt(rho / rho0 / chi); // aerodynamic diameter

    if (fl) {
        var fun_a = function (da) {
            return ((dve * Math.sqrt(rho / rho0 / chi * Cc(dve * 1e-9) / Cc(da * 1e-9)) - da)) ** 2
        }
        var a = optimjs.minimize_Powell(fun_a, [da])
        da = a.argument[0]
    }

    return da;
}

var dve2dm = function (dve, fl = true, chi = 1) {

    if (fl) {
        var fun_m = function (dm) {
            return (dve * chi * Cc(dm * 1e-9) / Cc(dve * 1e-9) - dm) ** 2
        }
        var a = optimjs.minimize_Powell(fun_m, [dve])
        dve = a.argument[0]
    }

    return dve * chi
}

var da2dm = function (da, rh = 1800, fl = true, chi = 1, prop) {
    var rho0 = 1e3; // density of water
    
    rh = dm2rho(da, prop) * 1e9

    // Compute simple volume-equivalent and aerodynamic diameters, 
    // that is without iteration. 
    var dve = da / Math.sqrt(rh / rho0 / chi); // aerodynamic diameter
    
    if (fl) {
        var fun_a = function (dve) {
            return (da / Math.sqrt(dm2rho(dve2dm(dve[0], fl, chi), prop) * 1e9 / rho0 / chi * Cc(dve * 1e-9) / Cc(da * 1e-9)) - dve) ** 2
        }
        var a = optimjs.minimize_Powell(fun_a, [dve])
        dve = a.argument[0]
    }

    var dm = dve2dm(dve, fl, chi)
    return dm
}

// Hatch-Choate (for moments)
var hc = function (mu, sg, q) {
    return mu * Math.exp(q * (Math.log(sg) ** 2))
}

// Hatch-Choate (integration over distribution)
var hci = function (mu, sg, q, a) {
    return a * mu ** q * Math.exp(1 / 2 * q ** 2 * (Math.log(sg) ** 2))
}

// Mechanical mobility
var dm2B = function (dm) {
    var mu = 1.84198E-05
    return (Cc(dm * 1e-9) / (3 * pi * mu * (dm * 1e-9))) * 1e-9
}

// Electrical mobility
var dm2Zp = function (dm) {
    var B = dm2B(dm)
    return (B * 1e9) * e * 100 ** 2
}

// Diffusion
var dm2D = function (dm, T = 298) {
    var B = dm2B(dm)
    return kB * T * (B / 1e-9) * (100 ** 2)
}