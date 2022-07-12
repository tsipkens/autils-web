const pi = 3.14159265359
const e = 1.60217733e-19
const kB = 1.380658e-23
const rho0 = 1e3 // density of water

var viscosity = function (T, p, gasProp) {
    return gasProp["mu_ref"] * (gasProp["Tref"] + gasProp["S"]) / (T + gasProp["S"]) * (T / gasProp["Tref"]) ** 1.5 * 1e-7
}

var mfp = function (T, p, gasProp) {
    // Kim et al. (2005) (doi:10.6028/jres.110.005), ISO 15900 Eqn 4.
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



//-------------------------------------------------------------------------//
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
    return prop['m0'] * (dm * 1e9) ** prop['zet']
}

var mp2dm = function (mp, prop) {
    return (mp / prop['m0']) ** (1 / prop['zet']) * 1e-9
}

var sdm2smp = function (smp, prop) {
    return Math.exp(prop['zet'] * Math.log(smp))
}

var rho = function (dm, m) {
    return 6 * m / (pi * dm ** 3)
}

var dm2rho = function (dm, prop) {
    return rho(dm, dm2mp(dm, prop))
}
//-------------------------------------------------------------------------//


//-------------------------------------------------------------------------//
// Other size conversions.
// For conversions, also see Kazemimanesh et al. (2022) (https://doi.org/10.1016/j.jaerosci.2021.105930). 

var dm2dve = function (dm, prop) {
    dve = dm * (dm2rho(dm, prop) / prop['rhom']) ** (1 / 3)
    return dve
}

var dve2dm = function (dve, prop) {
    dm = (prop['rhom'] * pi / (6 * prop['k']) * dve ** 3) ** (1 / prop['zet']) * 1e-9
    return dm
}

var dm2chi = function (dm, prop, fl = true) {
    dve = dm2dve(dm, prop);

    chi = dm / dve;

    if (fl) {
        chi = (dm / dve * Cc(dve) / Cc(dm))
    }

    return chi;
}

var dve2chi = function (dve, prop, fl = true) {
    dm = dve2dm(dve, prop);

    chi = dm / dve;

    if (fl) {
        chi = (dm / dve * Cc(dve) / Cc(dm))
    }

    return chi;
}

/*
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
*/

var da2dve = function (da, prop, fl = true) {
    da = da * 1e9
    if (fl) {
        var fun_a = function (dve) {
            return ((dve * Math.sqrt(prop['rhom'] / rho0 / dve2chi(dve * 1e-9, prop, fl) * Cc(dve * 1e-9) / Cc(da * 1e-9)) - da)) ** 2
        }
    } else {
        var fun_a = function (dve) {
            return (da / Math.sqrt(prop['rhom'] / rho0 / dve2chi(dve * 1e-9, prop, fl)) - dve) ** 2
        }
    }
    var a = optimjs.minimize_Powell(fun_a, [da])
    dve = a.argument[0] * 1e-9

    return dve
}

var dm2da = function (dm, prop, fl = true) {
    var dve = dm2dve(dm, prop)
    var chi = dm2chi(dm, prop, fl)

    // Compute simple volume-equivalent and aerodynamic diameters, 
    // that is without iteration. 
    var da = dve * Math.sqrt(prop['rhom'] / rho0 / chi); // aerodynamic diameter

    if (fl) {
        dve = dve * 1e9 // convert to nm for numerical stability
        da = da * 1e9
        var fun_a = function (da) {
            return ((dve * Math.sqrt(prop['rhom'] / rho0 / chi * Cc(dve * 1e-9) / Cc(da * 1e-9)) - da)) ** 2
        }
        var a = optimjs.minimize_Powell(fun_a, [da])
        da = a.argument[0] * 1e-9 // convert back to m
    }

    return da;
}

var da2dm = function (da, prop, fl = true) {
    dve = da2dve(da, prop, fl)

    var dm = dve2dm(dve, prop, fl)
    return dm
}

var sdm2sda = function (cmd, sg, prop, fl = true) {
    return Math.exp(
        (Math.log(dm2da(Math.exp(Math.log(cmd) * 1.05), prop, fl)) -
            Math.log(dm2da(Math.exp(Math.log(cmd) * 0.95), prop, fl))) /
        (0.1 * Math.log(cmd * 1e9)) *
        Math.log(sg)); // take about CMD
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
    return (Cc(dm) / (3 * pi * mu * (dm))) * 1e-9
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