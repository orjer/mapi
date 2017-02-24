
var responsive = (function(){	
	var resultado = "";

	var iniciar = function(){
		responsiveVoice.speech_onend = function(){
			speech.iniciar();
			speech.escuchar();
		};

		responsiveVoice.setDefaultVoice("Spanish Latin American Female");
	}

	var saludo = function(){
		if(responsiveVoice.voiceSupport()) {
			responsiveVoice.speak("¿Bienvenido a mapimundo, quieres que te ayude en algo?");
		}
	} 

	var leer = function(texto){
		if(responsiveVoice.voiceSupport()) {
			responsiveVoice.speak(texto);
		}
	}

	return {
		"iniciar": iniciar,
		"saludo": saludo,
		"leer": leer,
		"resultado": resultado
	}
})();