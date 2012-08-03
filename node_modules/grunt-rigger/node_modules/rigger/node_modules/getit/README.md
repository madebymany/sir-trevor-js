# Get It

This is a simple remote file loader that makes it easy to open both local and remote files in a simple (and consistent) way.

<a href="http://travis-ci.org/#!/DamonOehlman/getit"><img src="https://secure.travis-ci.org/DamonOehlman/getit.png" alt="Build Status"></a>

## Example Usage

Getting a file:

```js
getit('files/test.txt', function(err, data) {
    
});
```

Getting some online content:

```js
getit('http://www.google.com/', function(err, data) {
    
});
```

### Specifying the Current Working Directory

By default, all files are resolved to the current working directory through using  [path.resolve](http://nodejs.org/docs/latest/api/path.html#path.resolve).  The default directory resolved against can be overriden, however, by passing options to the `getit` function call:

```js
getit('files/test.txt', { cwd: __dirname }, function(err, data) {
    
});
```

Specifying the `cwd` option has no effect on remote requests, but there might be other options added in time to tweak the [request](https://github.com/mikeal/request) behaviour eventually.  The general principle is you should be able to use `getit` to get the content of both local and remote resources without having to dramatically change the way you use the library.

## Custom URL Schemes

Similar code to this has been implemented in the JS build tool [Interleave](https://github.com/DamonOehlman/interleave) and will eventually be replaced by integrating getit instead.  For this reason some helper URI schemes have been added.

### Github Includes (github://)

```js
getit('github://DamonOehlman/getit/index.js', function(err, data) {
});
```

## Contributing URL Schemes

I haven't as yet ported the schemes from interleave across yet, but the process is incredibly simple, and the content of the [github scheme translator](/DamonOehlman/getit/blob/master/lib/schemes/github.js) is shown below:

```js
var url = require('url');

module.exports = function(parts, original) {
    var pathParts = parts.pathname.replace(/^\//, '').split('/');
    
    return 'https://raw.github.com/' + parts.host + '/' + 
        pathParts[0] + '/master/' + pathParts.slice(1).join('/');
};
```

The task of the scheme translator is to convert a url of the custom scheme into a standard URI that can be passed to the [request](https://github.com/mikeal/request) library to GET.  

To create your own scheme translator simply fork the library, decide on the scheme / protocol prefix (e.g. github, flickr, etc) and then create the relevant translator in the `lib/schemes` directory.  When `getit` encounters a request for a url matching your custom scheme translator will be required and involved before actually requesting the url.  Simple.

<a name="using-streams" />
## Using Streams

If you would like to make use node's excellent streams support, then you can do that very easily.  Simply call `getit` but don't provide a callback function.  In this mode getit will return a stream that can be piped to another stream, e.g.

```js
getit('github://DamonOehlman/getit/test/files/test.txt').pipe(fs.createWriteStream('testfile.txt'));
```

## GetIt Options

The `getit` function supports a second argument for providing options to change the default getit behaviour.  

### Caching use `cachePath`

If you provide an optional `cachePath`, then getit will cache a copy of the data retrieved in the specified path.  In addition to the data retrieved, an [etag](http://en.wikipedia.org/wiki/HTTP_ETag) value will be stored in a lookup file.  This will be used in subsequent lookups using the `If-None-Match` header.

By default, caching will only occur on a server that provides an etag value, but this can be overridden by also setting the `cacheAny` option to true.

```js
var opts = {
    cachePath: '/tmp'
};

getit('github://DamonOehlman/getit/test/files/test.txt', opts, function(err, data) {
    
});
```

Finally, if you would prefer not to wait around for a HTTP request and a `304` response, then you can provide the `preferLocal` option always used the cached copy of a file if it exists in the cache folder.

### Aggressive caching with `preferLocal`

If you __really__ want to avoid a round-trip to web servers to check the freshness of the cache, then it might be worth using the `preferLocal` option also.  This instructs getit to skip the `etag` check if it finds the required file in the cache directory.

If you do decide to implement this functionality, it's recommended that you provide some option in your application to allow users to clear the local cache path.