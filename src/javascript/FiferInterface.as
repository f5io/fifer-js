package javascript
{
	import flash.external.ExternalInterface;
	
	public class FiferInterface
	{
		public static const CB_REGISTER_AUDIO 	: String = "registerAudio";
		public static const CB_PLAY 			: String = "playAudio";
		public static const CB_STOP 			: String = "stopAudio";
		public static const CB_STOP_ALL			: String = "stopAll";
		public static const CB_MUTE 			: String = "mute";
		public static const CB_UNMUTE 			: String = "unmute";
		public static const CB_MUTE_ALL 		: String = "muteAll";
		public static const CB_UNMUTE_ALL 		: String = "unmuteAll";
		public static const CB_MUTED 			: String = "muted";
		
		public static const RS_LOADED			: String = "responseLoaded";
		public static const RS_INITIALISED		: String = "responseInitialised";
		public static const RS_COMPLETED		: String = "responseCompleted";
		
		public static function on(method : String, callback : Function) : void {
			ExternalInterface.addCallback(method, callback);
		}
		
		public static function call(method : String, response : * = null) : void {
			ExternalInterface.call('Fifer.interface.' + method, response);
		}
	}
}