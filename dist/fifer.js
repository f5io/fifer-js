(function(w,d) {

	var _ = {},
		_files = {},
		_playing = {},
		_muted = false,
		_initialised = true,
		_queue = [],
		_loaded = function() {},
		_settings = {
			swf : '../lib/fifer.fallback.swf',
			force : false
		},
		_scope, _internals;

	_.support = (function() {
		return 'Audio' in w;
	})();

	_.warn = (function() {
		if ('console' in w && 'warn' in w.console) {
			return function() {
				console.warn(Array.prototype.slice.call(arguments)[0]);
			};
		} else {
			return function() {};
		}
	})();

	_.extend = function(o,e)
	{
		for (var p in e) {
			o[p] = (o.hasOwnProperty(p)) ? o[p] : e[p];
		}
		return o;
	};

	_.fallback = function() {

		var msie = /*@cc_on!@*/0;

		if (msie) {
			var html = '<object id="fifer-flash" data="' + _settings.swf + '" type="application/x-shockwave-flash" width="0" height="0">';
			html += ' <param name="movie" value="' + _settings.swf + '"/>';
			html += ' <param name="allowscriptaccess" value="always"/>';
			html += ' <param name="quality" value="high"/>';
			html += ' <param name="wmode" value="transparent"/>';
			html += ' <!-- Fifer Flash Fallback -->';
			html += ' </object>';

			var p = d.createElement('p');
			d.getElementsByTagName('body')[0].appendChild(p);
			p.innerHTML = html;
			return d.getElementById('fifer-flash');
		} else {
			var _flash = d.createElement('object');
			_flash.setAttribute('type', 'application/x-shockwave-flash');
			_flash.setAttribute('data', _settings.swf);
			_flash.setAttribute('width', '1');
			_flash.setAttribute('height', '1');

			var params = {
				'movie' : _settings.swf,
				'quality' : 'high',
				'bgcolor' : '#ffffff',
				'allowScriptAccess' : 'always',
				'allowFullScreen' : 'true'
			};

			for (var o in params) {
				var _p = d.createElement('param');
				_p.setAttribute('name', o);
				_p.setAttribute('value', params[o]);
				_flash.appendChild(_p);
			}

			d.getElementsByTagName('body')[0].appendChild(_flash);
			return _flash;
		}

	};

	_internals = {
		registerAudio : function($name, $src) {
			var a = new Audio();
			a.addEventListener('canplaythrough', function() {
				_internals.loaded($name);
			});
			a.preload = 'metadata';
			if (a.canPlayType('audio/mpeg') === '') {
				_.warn('[Fifer] Looks like you\'re trying this in Firefox, trying to find an .ogg file.');
				$src = $src.split('.mp3').join('.ogg');
				_files[$name].src = $src;
			}
			a.src = $src;
			a.load();
		},
		playAudio : function($name) {
			var id = $name + Math.random() * new Date().getTime();
			var a = new Audio();
			a.addEventListener('ended', function() {
				_internals.ended(id, $name);
			});
			a.src = _files[$name].src;
			a.load();
			_files[$name].playing = _files[$name].playing || [];
			_files[$name].playing.push(id);
			if (_files[$name].muted) {
				a.volume = 0;
			}
			_playing[id] = a;
			_playing[id].play();
		},
		stopAudio : function($name) {
			while (_files[$name].playing.length) {
				var p = _files[$name].playing.shift();
				_playing[p].pause();
				_playing[p].currentTime = 0;
				delete _playing[p];
			}
		},
		stopAll : function() {
			for (var a in _playing) {
				_playing[a].pause();
				_playing[a].currentTime = 0;
			}
			_playing = {};
		},
		mute : function($name) {
			if (_files[$name].playing.length) {
				for (var i = 0, j = _files[$name].playing.length; i < j; i++) {
					var p = _files[$name].playing[i];
					_playing[p].volume = 0;
				}
			}

			if ($name in _files) {
				_files[$name].muted = true;
			}
		},
		unmute : function($name) {
			if (_files[$name].playing.length) {
				for (var i = 0, j = _files[$name].playing.length; i < j; i++) {
					var p = _files[$name].playing[i];
					_playing[p].volume = 0;
				}
			}

			if ($name in _files) {
				_files[$name].muted = false;
			}
		},
		muteAll : function() {
			for (var p in _playing) {
				_playing[p].volume = 0;
			}

			for (var f in _files) {
				_files[f].muted = true;
			}
			_muted = true;
		},
		unmuteAll : function() {
			for (var p in _playing) {
				_playing[p].volume = 1;
			}

			for (var f in _files) {
				_files[f].muted = false;
			}
			_muted = false;
		},
		muted : function() {
			return _muted;
		},
		loaded : function($name) {
			_files[$name].loaded = true;
			for (var f in _files) {
				if (!_files[f].loaded) return;
			}
			var fn = {};
			fF[$name] = fF[$name] || function() {
				fF.play($name);
				return fF;
			};
			_loaded.call(fF, _files);
		},
		ended : function($id,$name) {
			if ($id in _playing) {
				_files[$name].playing.shift();
				delete _playing[$id];
			}
		},
		clearPlaying : function($name) {
			if (!_.support || _settings.force) {
				if (typeof $name === 'undefined') {
					for (var f in _files) {
						_files[f].playing = [];
					}
				} else {
					_files[$name].playing = [];
				}
			}
		}
	};

	var fF = function(obj) {
		_settings = _.extend(obj, _settings);
		_.initialise();
		return fF;
	};

	fF.registerAudio = function($name, $src, $multiple) {
		if (!_initialised) {
			_queue.push(['registerAudio', $name, $src, $multiple]);
			return fF;
		}
		_files[$name] = { src : $src, loaded : false, multiple : ($multiple || false), playing : [] };
		_scope.registerAudio($name, $src);
		return fF;
	};

	fF.play = function($name) {
		if (_files[$name].playing.length && !_files[$name].multiple) {
			_.warn('[Fifer] Audio: ' + $name + ' is already playing.');
			return fF;
		}
		if (!_files[$name].loaded) return;
		if (!($name in _files)) {
			_.warn('[Fifer] No audio registered with the name: ' + $name);
			return;
		}
		var p = _scope.playAudio($name);
		if (p) {
			_files[$name].playing = p.split(',');
		}
		return fF;
	};

	fF.stop = function($name) {
		if (typeof $name === 'undefined') {
			_internals.clearPlaying();
			_scope.stopAll();
		} else {
			if (!($name in _files)) {
				_.warn('[Fifer] No audio registered with the name: ' + $name);
				return fF;
			}
			if (!_files[$name].playing.length) {
				_.warn('[Fifer] The audio: ' + $name + ' is not currently playing.');
				return fF;
			}
			_internals.clearPlaying($name);
			_scope.stopAudio($name);
		}
		return fF;
	};

	fF.stopAll = function() {
		_internals.clearPlaying();
		_scope.stopAll();
		return fF;
	};

	fF.mute = function($name) {
		if (typeof $name === 'undefined') {
			_scope.muteAll();
		} else {
			if (!($name in _files)) {
				_.warn('[Fifer] No audio registered with the name: ' + $name);
				return;
			}
			_scope.mute($name);
		}
		return fF;
	};

	fF.unmute = function($name) {
		if (typeof $name === 'undefined') {
			_scope.unmuteAll();
		} else {
			if (!($name in _files)) {
				_.warn('[Fifer] No audio registered with the name: ' + $name);
				return;
			}
			_scope.unmute($name);
		}
		return fF;
	};

	fF.muteAll = function() {
		_scope.muteAll();
		return fF;
	};

	fF.unmuteAll = function() {
		_scope.unmuteAll();
		return fF;
	};

	fF.muted = function() {
		return _scope.muted();
	};

	fF.loaded = function(fn) {
		_loaded = fn;
		return fF;
	};

	_.initialise = function() {
		if (!_.support || _settings.force) {
			_initialised = false;
			fF.interface = {
				responseInitialised : function() {
					_.warn('[Fifer] Fifer is using a Flash Fallback as HTML5 Audio is not supported.');
					_initialised = true;
					while (_queue.length) {
						var q = _queue.shift();
						var m = q.shift();
						fF[m].apply(fF, q);
					}
				},
				responseLoaded : function($name) {
					_internals.loaded($name);
				},
				responseCompleted : function($name) {
					_internals.ended($name);
				}
			};
			_scope = _.fallback();
		} else {
			_scope = _internals;
		}
	};

	_.initialise();

	w.Fifer = w.fF = fF;

})(window,document);