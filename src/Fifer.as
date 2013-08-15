package
{
	import flash.display.Sprite;
	
	import javascript.FiferInterface;
	
	import manager.FiferManager;
	
	public class Fifer extends Sprite
	{
		public function Fifer()
		{
			init();
		}
		
		private function init() : void {
			
			FiferInterface.on(FiferInterface.CB_REGISTER_AUDIO, onRegisterAudio);
			FiferInterface.on(FiferInterface.CB_PLAY, onPlay);
			FiferInterface.on(FiferInterface.CB_STOP, onStop);
			FiferInterface.on(FiferInterface.CB_STOP_ALL, onStopAll);
			FiferInterface.on(FiferInterface.CB_MUTE, onMute);
			FiferInterface.on(FiferInterface.CB_UNMUTE, onUnmute);
			FiferInterface.on(FiferInterface.CB_MUTE_ALL, onMuteAll);
			FiferInterface.on(FiferInterface.CB_UNMUTE_ALL, onUnmuteAll);
			FiferInterface.on(FiferInterface.CB_MUTED, onMuted);
			
			FiferInterface.call(FiferInterface.RS_INITIALISED);
		}
		
		private function onRegisterAudio($name : String, $src : String, $multiple : Boolean = false) : void {
			FiferManager.sharedManager.registerAudio($name, $src, $multiple, function($n : String) : void {
				FiferInterface.call(FiferInterface.RS_LOADED, $n);
			});
		}
		
		private function onPlay($name : String, $loop : Boolean = false) : String {
			return FiferManager.sharedManager.play($name, $loop);
		}
		
		private function onStop($name : String) : void {
			FiferManager.sharedManager.stop($name);
		}
		
		private function onStopAll() : void {
			FiferManager.sharedManager.stopAll();
		}
		
		private function onMute($name : String) : void {
			FiferManager.sharedManager.mute($name);
		}
		
		private function onUnmute($name : String) : void {
			FiferManager.sharedManager.unmute($name);
		}
		
		private function onMuteAll() : void {
			FiferManager.sharedManager.muteAll();
		}
		
		private function onUnmuteAll() : void {
			FiferManager.sharedManager.unmuteAll();
		}
		
		private function onMuted() : Boolean {
			return FiferManager.sharedManager.muted;
		}
	}
}