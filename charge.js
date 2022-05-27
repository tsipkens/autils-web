
//-- CHARGING FUNCTIONS ----------------------------------------//
//   Incomplete at the moment.
var tfer_charge = function(d, z) {

    var e = 1.602177e-19, // elementary charge
      epi = 8.85418e-12, // dielectric constant (for air) [F/m]
      kB = 1.38065e-23, // Boltzmann's constant
      Z_Z = 0.875, // ion mobility ratio (Wiedensohler, 1988)
      T = 298; // temperature
  
    // Helper function to create a 2D array of zeros.
    // Used for fn in the next line.
    function zeros(dimensions) {
      var array = [];
      for (var i = 0; i < dimensions[0]; ++i) {
        array.push(dimensions.length == 1 ? 0 : zeros(dimensions.slice(1)));
      }
      return array;
    }
    var fn = zeros([z.length, d.length]) // initialize fn
    
    // Main loop.
    for (dd in d) {
      for (zz in z) {
        if (z[zz] < 3) { // if charge state less than 3
          // Gopalakrishnan below z = 3
          a = [
            [-0.3880, -8.0157, -40.714],
            [0.4545, 3.2536, 17.487],
            [-0.1634, -0.5018, -2.6146],
            [0.0091, 0.0223, 0.1282]
          ];
          exponent = 0;
          for (jj = 0; jj < 4; jj++) { // loop through coefficients in a
            exponent = exponent + (a[jj][z[zz]] * Math.pow(Math.log(d[dd] * 1e9), jj));
          }
          fn[zz][dd] = Math.exp(exponent);
        } else { // Wiedensohler for z = 3 and above
          fn[zz][dd] = e / Math.sqrt(4 * pi * pi * epi * kB * T * d[dd]) *
            Math.exp(0 - Math.pow(z[zz] - 2 * pi * epi * kB * T * Math.log(Z_Z) * d[dd] / Math.pow(e, 2), 2) /
              (4 * pi * epi * kB * T * d[dd] / Math.pow(e, 2)));
  
          if (fn[zz][dd] < 6e-5) {
            fn[zz][dd] = 0
          } // truncate small values
        }
      }
    }
    console.log(fn)
  
    return fn
  }


