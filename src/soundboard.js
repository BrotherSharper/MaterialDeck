import * as MODULE from "../MaterialDeck.js";
import {streamDeck} from "../MaterialDeck.js";

export class SoundboardControl{
    constructor(){
        this.offset = 0;
        this.activeSounds = [];
        for (let i=0; i<64; i++)
            this.activeSounds[i] = false;
    }

    async updateAll(){
        for (let i=0; i<32; i++){   
            let data = streamDeck.buttonContext[i];
            if (data == undefined || data.action != 'soundboard') continue;
            await this.update(data.settings,data.context);
        }
    }

    update(settings,context){
        let mode = settings.soundboardMode;
        if (mode == undefined) mode = 0;

        let txt = "";
        let src = "";
        let background = "#000000";

        if (mode == 0){ //play sound
            let soundNr = parseInt(settings.soundNr);
            if (isNaN(soundNr)) soundNr = 1;
            soundNr--;
            soundNr += this.offset;

            let soundboardSettings = game.settings.get(MODULE.moduleName, 'soundboardSettings');
            
            let onColor = soundboardSettings.colorOn[soundNr];
            let offColor = soundboardSettings.colorOff[soundNr];

            background = onColor;
            let ring = 2;
            if (this.activeSounds[soundNr]==false) {
                background = offColor;
                ring = 1;
            }
            if (settings.displayName) txt = soundboardSettings.name[soundNr];
            if (settings.displayIcon) src = soundboardSettings.img[soundNr];
            streamDeck.setTitle(txt,context);
            streamDeck.setIcon(1,context,src,background,ring,background);
        }
        else if (mode == 1) { //Offset
            src = "";
            let onBackground = settings.onBackground;
            if (onBackground == undefined) onBackground = '#00FF00';
            let offBackground = settings.offBackground;
            if (offBackground == undefined) offBackground = '#000000';

            let offset = parseInt(settings.offset);
            if (isNaN(offset)) offset = 0;
            if (offset == this.offset) background = onBackground;
            else background = offBackground;
            streamDeck.setTitle(txt,context);
            streamDeck.setIcon(1,context,src,background);
        }
        else if (mode == 2) {   //Stop all sounds
            let src = 'action/images/soundboard/stop.png';
            streamDeck.setIcon(0,context,src,settings.background);
        }
    }

    keyPressDown(settings){
        let mode = settings.soundboardMode;
        if (mode == undefined) mode = 0;
        if (mode == 0) {    //Play sound
            let soundNr = parseInt(settings.soundNr);
            if (isNaN(soundNr)) soundNr = 1;
            soundNr--;
            soundNr += this.offset;

            const playMode = game.settings.get(MODULE.moduleName,'soundboardSettings').mode[soundNr];

            let repeat = false;
            if (playMode > 0) repeat = true;
            let play = false;
            if (this.activeSounds[soundNr] == false) play = true;
            this.playSound(soundNr,repeat,play);
        }
        else if (mode == 1) { //Offset
            let offset = parseInt(settings.offset);
            if (isNaN(offset)) offset = 0;
            this.offset = offset;
            this.updateAll();
        }
        else {  //Stop All Sounds
            for (let i=0; i<64; i++) {
                if (this.activeSounds[i] != false){
                    this.playSound(i,false,false);
                }
            }
        }
    }

    keyPressUp(settings){
        let mode = settings.soundboardMode;
        if (mode == undefined) mode = 0;
        if (mode != 0) return;
        let soundNr = parseInt(settings.soundNr);
        if (isNaN(soundNr)) soundNr = 1;
        soundNr--;
        soundNr += this.offset;

        const playMode = game.settings.get(MODULE.moduleName,'soundboardSettings').mode[soundNr];
        
        if (playMode == 2)
            this.playSound(soundNr,false,false);
    }

    playSound(soundNr,repeat,play){  
        let trackId = game.settings.get(MODULE.moduleName,'soundboardSettings').sounds[soundNr];
        let volume = game.settings.get(MODULE.moduleName,'soundboardSettings').volume[soundNr]/100;
        volume = AudioHelper.inputToVolume(volume);
        if (trackId == "" || trackId == undefined) return;
        let payload = {
            "msgType": "playSound", 
            "trackNr": soundNr,
            "repeat": repeat,
            "play": play,
            "volume": volume
        };
        game.socket.emit(`module.MaterialDeck`, payload);
        if (play){
            let trackId = game.settings.get(MODULE.moduleName,'soundboardSettings').sounds[soundNr];
            let playlistId = game.settings.get(MODULE.moduleName,'soundboardSettings').playlist;
            let sounds = game.playlists.entities.find(p => p._id == playlistId).data.sounds;
            let sound = sounds.find(p => p._id == trackId);
            if (sound == undefined){
                this.activeSounds[soundNr] = false;
                return;
            }
            volume *= game.settings.get("core", "globalInterfaceVolume");
            let src = sound.path;

            let howl = new Howl({src, volume, loop: repeat, onend: (id)=>{
                if (repeat == false){
                    this.activeSounds[soundNr] = false;
                    this.updateAll();
                }
            },
            onstop: (id)=>{
                this.activeSounds[soundNr] = false;
                this.updateAll();
            }});
            howl.play();
            this.activeSounds[soundNr] = howl;
        }
        else {
            this.activeSounds[soundNr].stop();
            this.activeSounds[soundNr] = false;
        }
        this.updateAll();
    }
}