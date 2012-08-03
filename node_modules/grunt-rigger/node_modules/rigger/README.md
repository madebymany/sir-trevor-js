# Rigger

Rigger is a build time include engine for Javascript, CSS, CoffeeScript and in general any type of text file that you wish to might want to "include" other files into.

<a href="http://travis-ci.org/#!/DamonOehlman/rigger"><img src="https://secure.travis-ci.org/DamonOehlman/rigger.png" alt="Build Status"></a>

It was created to make the process of creating Javascript libraries a more structured process, but can be used for other tasks also. 

As a developer you are encouraged to write modular, reusable code but when it comes to writing client-side applications your ability to do this effectively is generally hampered by what I call the _single-file principle_.  In most cases a good programmer rages against this and implements some kind of custom `Makefile`, [ant build](http://ant.apache.org/) or [Rakefile](http://rake.rubyforge.org/) to help with their build.

The "build" process, however, generally involves taking a number of files and concatenating them together in a sensible order.  I, however, wanted something more flexible.  To be precise, I wanted the following:

- The ability to inject a file into specific line in another file.
- The ability to reuse code from other libraries.
- The ability to do includes from the web (namely github repos)

This is the functionality that Rigger provides.  It was originally built 6 months ago as part of [Interleave](/DamonOehlman/interleave) but has it's own identity, tests and is generally better.

## Using Rigger

First you will want to install it.  You'll need [npm](http://npmjs.org) to do this, once you do you can simply run `npm install -g rigger`. To get starting using rigger, you simply start placing special __include comments__ in a file that you want rigger to process.

__Javascript:__

```js
//= includes/test
```

__CoffeeScript:__

```coffee
#= includes/test
```

__CSS:__

```css
/*= includes/test */
```

Notice that each of the examples is using single-line comments (even if they are a block comment in the case of the CSS example).  This is important to note as Rigger parses files on a __line by line__ basis rather through through tokenizing.  If you use block comments like the following CSS example, it won't work:

```css
/*=
includes/test1
includes/test2
*/
```

Once you have a file that is has been properly rigged, you can use the `rig` command line tool to turn a rigged file into it's big brother:

```
rig input.js > output.js
```

## Include All the Things

Rigger supports a number of special include formats, and these are demonstrated in examples below.  While JS examples are provided, the formats will work in any of the known file formats.

### Remote Resources

Remote resources are those stored accessible via HTTP (or HTTPS).  

__HTTP(S) Include:__

```js
// include jquery from the CDN so you can run offline perhaps...
//= http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js
```

__Github Include:__

```js
//= github://DamonOehlman/alignit/alignit.js
```

### Multiple File Include

Being lazy is ok.  Rigger provides some nice shortcuts to help you in your quest:

__Directory Includes:__

Simply specify a directory in the include string and all files of the same type as the currently parsed file will be included.  In the tests/input directory have a look for the `local-includedir.js` and `local-includedir.css` files.

```js
//= ../includes/testdir
```

__Cherrypick Include:__

In some instances you may want to cherrypick particular files from a directory / remote repository.  Rather than typing multiple include lines, you can simply type one statement and use square brackets to signal to Rigger that you want to include multiple files:

```js
//= ../includes/testdir[a, b]
```

## Plugin Support

In addition to including files you can also use some plugins to extend the core functionality.  To flag that you want to use a plugin in your core files, use add the word plugin __directly__ after the `=` in the comment (e.g. `//=plugin name params`, `/*=plugin name params */`, `#=plugin name params`, etc).

More soon...

## Programmatic Use

To be completed.

## Streams FTW!

One of the simplest ways of composing process flows in node is to use streams, and while Interleave does not support a streaming interface, Rigger inherits from the node [Stream](http://nodejs.org/docs/latest/api/stream.html).

This means that you can do all kinds of things prior to rigging in your inline dependencies and all kinds of things afterwards to.