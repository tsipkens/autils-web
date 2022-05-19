
const pi = 3.14159265359;

var Cc = function(d, T=null, p=null) {

    if (p==null) {  // if P and T are not specified, use Buckley/Davies
        mfp = 66.5e-9;  // mean free path
        
        // For air, from Davies (1945).
        A1 = 1.257;
        A2 = 0.4;
        A3 = 0.55;
    } else {  // Kim et al. (adapted from Olfert laboratory)
        S = 110.4;       // temperature [K]
        mfp_0 = 67.3e-9; // mean free path of gas molecules in air [m]
        T_0 = 296.15;    // reference temperature [K]
        p_0 = 101325;    // reference pressure, [Pa] (760 mmHg to Pa)
        
        p = p * p_0;
        
        // Kim et al. (2005) (doi:10.6028/jres.110.005), ISO 15900 Eqn 4
        // Correct default mean free path.
        mfp = mfp_0 * (T/T_0) ** 2 * (p_0/p) * ((T_0+S)/(T+S));
        
        A1 = 1.165;
        A2 = 0.483;
        A3 = 0.997/2;
        
    }

    Kn = (2 * mfp) / d;  // Knudsen number
    return 1 + Kn * (A1 + A2 * Math.exp(-(2 * A3) / Kn));  // Cunningham slip correction factor
}

var massmob = function(zet, val, field='rho100') {
    prop = {
        zet: zet,
        rho100: 0,
        rho0: 0,
        m100: 0,
        m0: 0
    };
    if (field =='rho100') {
        prop['m100'] = rho100 * pi / 6 * (100e-9) ** 3;
        prop['m0'] = prop['m100'] * (1 / 100) ** prop['zet'];
    }

    // Fill out parameters based on above.
    prop['m100'] = prop['m0'] / ((1 / 100) ** prop['zet']);
    prop['rho0'] = prop['m0'] * 6 / pi * 1e27;
    prop['rho100'] = prop['m100'] * 6 / pi / (100e-9 ** 3);
    prop['k'] = prop['m0'];  // copy to k (alternative notation)

    console.log(prop);

    return prop
}

var dm2mp = function(dm, prop) {
    return prop['m0'] * dm ** prop['zet'];
}

var rho = function(dm, m) {
    return 6 * m / (pi * dm ** 3);
}

var dm2dve = function(dm, rho=1800, fl=true, chi=1) {
    dve = dm / chi;  // volume equivalent diameter
    
    if (fl) {
        var fun_ve = function(dve) {
            return ((dm / chi * Cc(dve * 1e-9) / Cc(dm * 1e-9) - dve)) ** 2
        }
        a = optimjs.minimize_Powell(fun_ve, [dve])
        dve = a.argument[0]
    }

    return dve
}

var dm2da = function(dm, rho=1800, fl=true, chi=1, dve=dm2dve(dm, rho, fl, chi)) {
    var rho0 = 1e3;  // density of water
    
    // Compute simple volume-equivalent and aerodynamic diameters, 
    // that is without iteration. 
    da = dve * Math.sqrt(rho / rho0 / chi);  // aerodynamic diameter

    if (fl) {
        var fun_a = function(da) {
            return ((dve * Math.sqrt(rho / rho0 / chi * Cc(dve * 1e-9) / Cc(da * 1e-9)) - da)) ** 2
        }
        a = optimjs.minimize_Powell(fun_a, [da])
        da = a.argument[0]
    }

    return da;
}


