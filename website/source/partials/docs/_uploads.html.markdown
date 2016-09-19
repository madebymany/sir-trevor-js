# Setting up image uploading

Adding images to a document is basic functionality in Sir Trevor JS. Setting it up is fairly simple, but does require an understanding of the component parts.

Sir Trevor is not a CMS — it is a focused tool to create and edit structured content — and needs to be integrated into a system that handles all the other parts that are associated with a CMS (e.g. user authentication, CRUD actions to fetch and store the content, etc.). For this reason, the server-side handling of uploaded files needs to be set up separately.

Like most web forms, a Sir Trevor document is sent to the server when a user saves the document (i.e. submits the form). But when you add a new image block and choose the image file to be displayed, it is uploaded immediately (via an Ajax request).

The image file will be sent to a server-side file handler. Listed below, there are many backend implementations of Sir Trevor for various languages and frameworks that include this functionality.

The image block that gets saved with the rest of the Sir Trevor-generated structured content only contains an URL reference to the uploaded image (i.e. no actual image data).

## Flow of events

1. User adds a Sir Trevor image block and chooses an image file
2. The image file is immediately sent to the server end point
3. The end point returns a response that includes an URL reference to the image

The end point of the file upload handler is defined in the config object used when [initialising Sir Trevor](docs.html#1-2).

```js
SirTrevor.setDefaults({
  uploadUrl: '/images'
});
```

## Format of file upload request

The image is sent to the file handler as an Ajax POST request. The request includes an `attachment` hash that has three properties:

- `attachment[name]` – the files name
- `attachment[file]` – the file
- `attachment[uid]` – a unique identifier for this file

## Format of response that Sir Trevor expects

Sir Trevor expects a response back from the file handler as a JSON object:

```js
{
  file: {
    url: '/xyz/abc.jpg'
  }
}
```

The JSON object can be more complex and include more information as well, but, by default, Sir Trevor’s image block only looks at the `response.file.url` value.

## Example file upload handlers

- [Example using Rails + Carrierwave](https://gist.github.com/cjbell/7091537)
- [Pedroaxl’s rewrite (in Coffeescript) that supports uploading to S3 (Ruby)](https://gist.github.com/pedroaxl/7302010)
- [Upload handler in a Laravel controller (PHP)](https://github.com/caouecs/Laravel-SirTrevorJS/blob/master/src/Caouecs/Sirtrevorjs/Controller/SirTrevorJsController.php)
- For more examples, take a look at the [various Sir Trevor implementations](https://github.com/madebymany/sir-trevor-js#implementations)
