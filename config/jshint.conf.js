var jsHintDefaultOptions = {
  // Errors
  bitwise: true,
  camelcase: false,
  curly: true,
  eqeqeq: true,
  forin: true,
  freeze: true,
  immed: true,
  indent: 2,
  latedef: true,
  newcap: true,
  noarg: true,
  nonbsp: true,
  nonew: true,
  strict: true,
  maxparams: 5,
  maxdepth: 3,
  maxcomplexity: 12,
  undef: true,
  unused: "vars",

  // Relax
  eqnull: true,

  // Envs
  browser: true,
  jquery: true,
  node: true,

  esnext: true
};

module.exports = {
  lib: {
    src: ["index.js", "src/**/*.js"],
    options: Object.assign({}, jsHintDefaultOptions, {
      jquery: false,
      globals: {
        i18n: true,
        webkitURL: true
      }
    })
  },

  tests: {
    src: ["spec/**/*.js"],
    options: Object.assign({}, jsHintDefaultOptions, {
      globals: {
        _: true,
        SirTrevor: true,
        i18n: true,
        webkitURL: true,
        jasmine: true,
        describe: true,
        expect: true,
        it: true,
        spyOn: true,
        beforeEach: true,
        afterEach: true,
        beforeAll: true,
        afterAll: true,
        xit: true
      }
    })
  }
};
