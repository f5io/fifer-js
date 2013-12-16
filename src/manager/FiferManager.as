package manager
{
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.media.Sound;
	import flash.media.SoundChannel;
	import flash.media.SoundMixer;
	import flash.media.SoundTransform;
	import flash.net.URLRequest;
	import flash.utils.ByteArray;
	
	import javascript.FiferInterface;
	
	public class FiferManager extends Sprite
	{
		private static var _instance : FiferManager;
		private static var _files : Object = {};
		private static var _playing : Object = {};
		private static var _muted : Boolean = false;
		
		public function FiferManager(se : SingletonEnforcer)
		{
			if (se == null)
			{
				throw new Error("[FiferManager] FiferManager is a Singleton. Please retrieve the instance with FiferManager.sharedManager.");
			}
		}
		
		public static function get sharedManager() : FiferManager {
			if (_instance == null) {
				_instance = new FiferManager(new SingletonEnforcer());
				_instance.addEventListener(Event.ENTER_FRAME, enterFrameHandler);
			}
			return _instance;
		}
		
		private static function enterFrameHandler(e : Event) : void
		{
			var count : int = 0;
			for (var o : * in _playing) count++;
			if (count > 0) {
				var array : Array = new Array();
				var bytes : ByteArray = new ByteArray();
				SoundMixer.computeSpectrum(bytes, true, 0);
				for (var i : int = 0; i < 512; i++) {
					array.push(bytes.readUnsignedByte());
				}
				FiferInterface.call(FiferInterface.RS_SPECTRUM, array);
			}
		}
		
		public function registerAudio($name : String, $src : String, $multiple : Boolean, $callback : Function) : FiferManager
		{
			var _name : String = $name;
			var _sound : Sound = new Sound();
			
			_sound.load(new URLRequest($src));
			_sound.addEventListener(Event.COMPLETE, registerComplete);
			
			_files[_name] = { s : _sound, st : new SoundTransform(), multiple : $multiple, playing : [] };
			
			function registerComplete(e : Event) : void {
				$callback(_name);
			}
			
			return _instance;
		}
		
		public function play($name : String, $loop : Boolean = false) : Object
		{
			var s : Sound = _files[$name].s;
			var id : String = $name + Math.random() * new Date().valueOf();
			_files[$name].playing.push(id);
			_playing[id] = s.play(0, ($loop) ? int.MAX_VALUE : 0, _files[$name].st);
			_playing[id].addEventListener(Event.SOUND_COMPLETE, function(e : Event) : void {
				e.currentTarget.removeEventListener(Event.SOUND_COMPLETE, arguments.callee);
				//_files[$name].playing.shift();
				FiferInterface.call(FiferInterface.RS_COMPLETED, [id, $name]);
				stop($name);
			});
			return { playing : _files[$name].playing, id : id };
		}
		
		public function stop($name : String) : FiferManager
		{
			while (_files[$name].playing.length) {
				var p : String = _files[$name].playing.shift();
				var sc : SoundChannel = _playing[p];
				sc.stop();
				delete _playing[p];		
			}
			return _instance;
		}
		
		public function stopAll() : FiferManager
		{
			for (var s : String in _playing) {
				var sc : SoundChannel = _playing[s];
				sc.stop();
				delete _playing[s];
			}
			return _instance;
		}
		
		public function mute($name : String) : FiferManager
		{
			if (_files.hasOwnProperty($name)) {
				var st : SoundTransform = _files[$name].st;
				st.volume = 0;
				for (var i : int = 0, j : int = _files[$name].playing.length; i < j; i++) {
					var p : String = _files[$name].playing[i];
					var sc : SoundChannel = _playing[p];
					sc.soundTransform = new SoundTransform(0);
				}
			}
			return _instance;
		}
		
		public function muteAll() : FiferManager
		{
			for (var p : String in _playing) {
				var sc : SoundChannel = _playing[p];
				sc.soundTransform = new SoundTransform(0);
			}
			
			for (var s : String in _files) {
				var st : SoundTransform = _files[s].st;
				st.volume = 0;
			}
			
			_muted = true;
			return _instance;
		}
		
		public function unmute($name : String) : FiferManager
		{
			if (_files.hasOwnProperty($name)) {
				var st : SoundTransform = _files[$name].st;
				st.volume = 1;
				for (var i : int = 0, j : int = _files[$name].playing.length; i < j; i++) {
					var p : String = _files[$name].playing[i];
					var sc : SoundChannel = _playing[p];
					sc.soundTransform = new SoundTransform(1);
				}
			}
			return _instance;
		}
		
		public function unmuteAll() : FiferManager
		{
			for (var p : String in _playing) {
				var sc : SoundChannel = _playing[p];
				sc.soundTransform = new SoundTransform(1);
			}
			
			for (var s : String in _files) {
				var st : SoundTransform = _files[s].st;
				st.volume = 1;
			}
			
			_muted = false;
			return _instance;
		}
		
		public function get muted() : Boolean
		{
			return _muted;
		}
	}
}


class SingletonEnforcer {
	
}