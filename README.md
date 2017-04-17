# Fifer

## A lightweight conductor for the HTML5 Audio API with Flash Fallback.

**Author:** *Joe Harlow* (<joe@f5.io>)

---

`Fifer` provides a conductor for handling the use of the HTML5 `Audio API` in your application or game. Where the HTML5 `Audio API` is not available a lightweight (~4kb) Flash fallback is used.

`Fifer` works best with `mp3`s as its main file type, while providing `ogg` fallbacks for Mozilla Firefox.

### Browser Support
---

`Fifer` is built on the `HTML5 Audio API`, and will attempt to preload audio files. `Mobile Safari` will not allow the preloading of audio files, however, `Fifer` will degrade gracefully and will work to some extent.

`Fifer` also provides a lightweight Flash fallback where the `Audio API` is not available. The Flash fallback requires at least `Flash Player 11.1`.

`Fifer` will use the HTML5 `Audio API` in the following browsers:

- Microsoft Internet Explorer 9+
- Mozilla Firefox 21.0+
- Google Chrome 27.0+
- Apple Safari 5.1+
- Opera 15.0+

`Fifer` will fallback to Flash in older browsers.


### Installation
---

`Fifer` can be installed with `bower`, by running:

`bower install fifer`

### Usage
---

`Fifer` can be accessed using either `Fifer` or `fF`. From here on out, we will refer to it as `Fifer`.

#### `Fifer`(`config /* Object */`)

`Fifer` itself is a function object. Calling `Fifer`(`config`) will set the global variables and return itself to enable chaining of functionality.

The `config` object can have the following properties:

- #####`force` (`boolean`)
	Setting `force` to true will force the use of the Flash fallback in all instances.
	
	Default: `false`.
- #####`swf` (`String`)
	The path that the Flash fallback is available from relative to your document root.
	
	Default: `../lib/fifer.fallback.swf`.

##### Example

    Fifer({
	    force: true, // force the use of the Flash fallback
	    swf: 'fifer/fifer.fallback.swf' // set path to Flash fallback swf
    });
    
### Methods (chainable)
---

#### `loaded`(`fn /* Function */`)

The `Function` passed into the `loaded` method will be fired whenever all files in the file stack are preloaded. The first argument passed into `fn` will be the file stack from `Fifer`, `Fifer` also will be passed into the `scope` of `fn`.

##### Example

    Fifer.loaded(function(files){
		console.log(files); // logs out the file stack
	});

#### `registerAudio`(`name /* String */`,`path /* String */`[, `playMultiple /* boolean : false */`])

The `registerAudio` method is used to register an audio file with `Fifer`. Once a file is registered, it is immediately preloaded from the `path` argument. The `playMultiple` argument dictates whether a file can have multiple instances played at the same time. `playMultiple` is an optional argument and defaults to false.

`Fifer` is extended with a `Function` called by the `name` argument where possible (ie. where the `name` does not conflict with a `Fifer` method). When called this `Function` will play the file.

Calling `registerAudio` later in your application where the `loaded` `Function` has already been called will cause `loaded` to be called again.

**N.B. To support Mozilla Firefox, `Fifer` requires both the standard `mp3` format files, along with `ogg` fallbacks. The files should be named exactly the same and in the same location. This fallback is automatic.**

##### Example

    Fifer
        .loaded(function(files){
	    	console.log(files); // logs out the file stack
	    	this.bang(); // play the bang file once it's loaded
	    })
	    .registerAudio('bang', 'bang.mp3', true);
	    
#### `play`(`name /* String */`[,`loop /* boolean : false */`, `ended /* Function */`])

The `play` method will play the audio file determined by it's name in the file stack. Providing a `loop` argument will allow you to set the file to loop indefinitely. The `ended` Function is an optional callback for when the audio file has finished playing.

##### Example

    Fifer
    	/* The audio file mapped to 'bang' will be
    	   played and looped indefinitely */
        .play('bang', true);
        
The same can be achieved with the following:

	Fifer
    	/* The audio file mapped to 'bang' will be
    	   played and looped indefinitely */
        .bang(true);

#### `stop`([`name /* String */`])

If a `name` argument is provided, the `stop` method will stop all playing instances of that audio file.

If no `name` argument is provided, all currently playing audio will stop.

##### Example

    Fifer.stop('bang'); // will stop only playing instances of 'bang'
    Fifer.stop(); // will stop all playing audio


#### `stopAll`()

The `stopAll` method will stop all currently playing audio.

##### Example

    Fifer.stopAll(); // will stop all playing audio

#### `mute`([`name /* String */`])

If a `name` argument is provided, the `mute` method will mute all playing instances of that audio file. 

If no `name` argument is provided, all audio in the file stack will be muted until unmuted.

**If a file is called to play while it is registered as muted, it will play muted.**

##### Example

    Fifer.mute('bang'); // all instances of 'bang' will be muted until unmuted
    Fifer.mute(); // will mute all audio until unmuted
    
#### `muteAll`()

The `muteAll` method will mute all audio in the stack until unmuted.

##### Example

    Fifer.muteAll(); // will mute all audio until unmuted
    
#### `unmute`([`name /* String */`])

If a `name` argument is provided, the `unmute` method will unmute all instances of that audio file. 

If no `name` argument is provided, all audio in the file stack will be unmuted.

##### Example

    Fifer.unmute('bang'); // all instances of 'bang' will be unmuted
    Fifer.unmute(); // will unmute all audio in the file stack
    
#### `unmuteAll`()

The `unmuteAll` method will unmute all audio in the stack.

##### Example

    Fifer.unmuteAll(); // will unmute all audio in the file stack

#### `isPlaying`([`name /* String */`])

If a `name` argument is provided, it will check to see if a specific file is playing and return a boolean.

If no `name` argument is provided, it will return a boolean showing if `Fifer` is currently playing *any* audio file.

##### Example

   Fifer.isPlaying('bang'); // will return true if the audio file registered as bang is playing

#### `onAudioProcess`([`fn /* Function */`])

The `fn` argument will be called when audio is processed, either using `AudioContext` or Flash's native `computeSpectrum`. An array of values will be passed to Function containing Byte Frequency data from the audio stream.

*Due to a [bug](http://stackoverflow.com/questions/13958158/why-arent-safari-or-firefox-able-to-process-audio-data-from-mediaelementsource) in Safari's handling of analyzing a MediaElementSource, Safari currently reports the array passed to the Function as empty (0) values*

##### Example

   Fifer.onAudioProcess(function(arr) {
       console.log(arr);
   });
    
#### `!dynamic!`([`loop /* boolean : false */`, `ended /* Function */`])

Once a file has been registered with `Fifer` and it has preloaded, `Fifer` will be extended with a `Function` named after that file.

Calling this dynamic `Function` will play the file. It will also take a `loop` parameter to allow indefinite looping of the file and an `ended` callback for when the audio file has finished playing.

##### Example

    Fifer.loaded(function(files){
    		/* Fifer is extended with a Function called 'aReallyLongNameThingimajig' */
	    	this.aReallyLongNameThingimajig(true); // play the 'aReallyLongNameThingimajig' file and loop indefinitely
	    })
	    .registerAudio('aReallyLongNameThingimajig', 'test.mp3', true);
    
### License
---

Copyright (C) 2013 Joe Harlow (Fourth of 5 Limited)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.









