import * as MODULE from "../MaterialDeck.js";
import {streamDeck} from "../MaterialDeck.js";

export class OtherControls{
    constructor(){
        this.active = false;
        this.rollData = {};
    }

    async updateAll(){
        if (this.active == false) return;
        for (let i=0; i<32; i++){   
            const data = streamDeck.buttonContext[i];
            if (data == undefined || data.action != 'other') continue;
            await this.update(data.settings,data.context);
        }
    }

    update(settings,context){
        this.active = true;
        const mode = settings.otherMode ? settings.otherMode : 'pause';

        if (mode == 'pause')    //pause
            this.updatePause(settings,context);
        else if (mode == 'controlButtons')    //control buttons
            this.updateControl(settings,context);
        else if (mode == 'darkness')   //darkness
            this.updateDarkness(settings,context);
        else if (mode == 'rollDice')    //roll dice
            this.updateRollDice(settings,context);
        else if (mode == 'rollTables')    //roll tables
            this.updateRollTable(settings,context);
        else if (mode == 'sidebarTab')    //open sidebar tab
            this.updateSidebar(settings,context);
        else if (mode == 'compendium')    //open compendium
            this.updateCompendium(settings,context);
        else if (mode == 'journal')    //open journal
            this.updateJournal(settings,context);
        else if (mode == 'chatMessage')
            this.updateChatMessage(settings,context);
    }

    keyPress(settings,context){
        const mode = settings.otherMode ? settings.otherMode : 'pause';

        if (mode == 'pause')     //pause
            this.keyPressPause(settings);
        else if (mode == 'controlButtons')    //control buttons
            this.keyPressControl(settings);
        else if (mode == 'darkness')    //darkness controll
            this.keyPressDarkness(settings);
        else if (mode == 'rollDice')    //roll dice
            this.keyPressRollDice(settings,context);
        else if (mode == 'rollTables')    //roll tables
            this.keyPressRollTable(settings);
        else if (mode == 'sidebarTab')    //sidebar
            this.keyPressSidebar(settings);
        else if (mode == 'compendium')    //open compendium
            this.keyPressCompendium(settings);
        else if (mode == 'journal')    //open journal
            this.keyPressJournal(settings);
        else if (mode == 'chatMessage')
            this.keyPressChatMessage(settings);
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////

    updatePause(settings,context){
        if (MODULE.getPermission('OTHER','PAUSE') == false ) {
            streamDeck.noPermission(context);
            return;
        }

        let src = "";
        const pauseFunction = settings.pauseFunction ? settings.pauseFunction : 'pause';
        const background = settings.background ? settings.background : '#000000';
        const ringOffColor = settings.offRing ? settings.offRing : '#000000';
        const ringOnColor = settings.onRing ? settings.onRing : '#00FF00';
        let ringColor = game.paused ? ringOnColor : ringOffColor;

        if (pauseFunction == 'pause') //Pause game
            src = 'modules/MaterialDeck/img/other/pause/pause.png';
        else if (pauseFunction == 'resume'){ //Resume game
            ringColor = game.paused ? ringOffColor : ringOnColor;
            src = 'modules/MaterialDeck/img/other/pause/resume.png';
        }
        else if (pauseFunction == 'toggle')  //toggle
            src = 'modules/MaterialDeck/img/other/pause/playpause.png';
        streamDeck.setIcon(context,src,{background:background,ring:2,ringColor:ringColor,overlay:true});
        streamDeck.setTitle('',context);
    }

    keyPressPause(settings){
        if (MODULE.getPermission('OTHER','PAUSE') == false ) return;
        
        const pauseFunction = settings.pauseFunction ? settings.pauseFunction : 'pause';

        if (pauseFunction == 'pause'){ //Pause game
            if (game.paused) return; 
            game.togglePause();
        }
        else if (pauseFunction == 'resume'){ //Resume game
            if (game.paused == false) return; 
            game.togglePause();
        }
        else if (pauseFunction == 'toggle') { //toggle
            game.togglePause();
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////
    
    updateControl(settings,context){
        if (MODULE.getPermission('OTHER','CONTROL') == false ) {
            streamDeck.noPermission(context);
            return;
        }
        const control = settings.control ? settings.control : 'dispControls';
        const tool = settings.tool ?  settings.tool : 'open';
        let background = settings.background ? settings.background : '#000000';
        let ringColor = '#000000'
        let txt = "";
        let src = "";
        const activeControl = ui.controls.activeControl;
        const activeTool = ui.controls.activeTool;

        if (control == 'dispControls') { //displayed controls
            let controlNr = parseInt(settings.controlNr);
            if (isNaN(controlNr)) controlNr = 1;
            controlNr--;

            const selectedControl = ui.controls.controls[controlNr];
            if (selectedControl.visible == false) {
                streamDeck.noPermission(context,false);
                return;
            }
            if (selectedControl != undefined){
                if (tool == 'open'){  //open category
                    txt = game.i18n.localize(selectedControl.title);
                    src = selectedControl.icon;
                    if (activeControl == selectedControl.name)
                        ringColor = "#FF7B00";
                }
            }
        }
        else if (control == 'dispTools'){  //displayed tools
            let controlNr = parseInt(settings.controlNr);
            if (isNaN(controlNr)) controlNr = 1;
            controlNr--;

            const selectedControl = ui.controls.controls.find(c => c.name == ui.controls.activeControl);
            if (selectedControl != undefined){
                const selectedTool = selectedControl.tools[controlNr];
                if (selectedTool != undefined){
                    if (selectedControl.visible == false || selectedTool.visible == false) {
                        streamDeck.noPermission(context,false);
                        return;
                    }
                    txt = game.i18n.localize(selectedTool.title);
                    src = selectedTool.icon;
                    if (selectedTool.toggle){
                        background = "#340057"
                        ringColor = selectedTool.active ? "#A600FF" : "#340057";
                    }
                    else if (activeTool == selectedTool.name)
                        ringColor = "#FF7B00";
                }  
            }
        }
        else {  // specific control/tool
            const selectedControl = ui.controls.controls.find(c => c.name == control);
            if (selectedControl != undefined){
                if (selectedControl.visible == false) {
                    streamDeck.noPermission(context,false);
                    return;
                }
                if (tool == 'open'){  //open category
                        txt = game.i18n.localize(selectedControl.title);
                        src = selectedControl.icon;
                        if (activeControl == selectedControl.name)
                            ringColor = "#FF7B00";
                }
                else {
                    const selectedTool = selectedControl.tools.find(t => t.name == tool);
                    if (selectedTool != undefined){
                        if (selectedTool.visible == false) {
                            streamDeck.noPermission(context,false);
                            return;
                        }
                        txt = game.i18n.localize(selectedTool.title);
                        src = selectedTool.icon;
                        if (selectedTool.toggle){
                            background = "#340057";
                            ringColor = selectedTool.active ? "#A600FF" : "#340057";
                        }
                        else if (activeTool == selectedTool.name && activeControl == selectedControl.name)
                            ringColor = "#FF7B00";
                    }
                }
            }
        }
        streamDeck.setIcon(context,src,{background:background,ring:2,ringColor:ringColor});
        streamDeck.setTitle(txt,context);
    }

    keyPressControl(settings){
        if (MODULE.getPermission('OTHER','CONTROL') == false ) return;
        if (canvas.scene == null) return;
        const control = settings.control ? settings.control : 'dispControls';
        const tool = settings.tool ?  settings.tool : 'open';
        
        if (control == 'dispControls'){  //displayed controls
            let controlNr = parseInt(settings.controlNr);
            if (isNaN(controlNr)) controlNr = 1;
            controlNr--;
            const selectedControl = ui.controls.controls[controlNr];
            if (selectedControl != undefined){
                if (selectedControl.visible == false) {
                    streamDeck.noPermission(context,false);
                    return;
                }
                ui.controls.activeControl = 'token';
                selectedControl.activeTool = selectedControl.activeTool;
                canvas.getLayer(selectedControl.layer).activate();
            }
        }
        else if (control == 'dispTools'){  //displayed tools
            let controlNr = parseInt(settings.controlNr);
            if (isNaN(controlNr)) controlNr = 1;
            controlNr--;
            const selectedControl = ui.controls.controls.find(c => c.name == ui.controls.activeControl);
            if (selectedControl != undefined){
                if (selectedControl.visible == false) {
                    streamDeck.noPermission(context,false);
                    return;
                }
                const selectedTool = selectedControl.tools[controlNr];
                if (selectedTool != undefined){
                    if (selectedTool.visible == false) {
                        streamDeck.noPermission(context,false);
                        return;
                    }
                    if (selectedTool.toggle) {
                        selectedTool.active = !selectedTool.active;
                        selectedTool.onClick(selectedTool.active);
                    }
                    else if (selectedTool.button){
                        selectedTool.onClick();
                    }
                    else
                        selectedControl.activeTool = selectedTool.name;
                }  
            }
        }
        else {  //select control
            const selectedControl = ui.controls.controls.find(c => c.name == control);
            if (selectedControl != undefined){
                if (selectedControl.visible == false) {
                    streamDeck.noPermission(context,false);
                    return;
                }
                if (tool == 'open'){  //open category
                    ui.controls.activeControl = 'token';
                    selectedControl.activeTool = selectedControl.activeTool;
                    canvas.getLayer(selectedControl.layer).activate();
                }
                else {
                    const selectedTool = selectedControl.tools.find(t => t.name == tool);
                    if (selectedTool != undefined){
                        if (selectedTool.visible == false) {
                            streamDeck.noPermission(context,false);
                            return;
                        }
                        ui.controls.activeControl = control;
                        canvas.getLayer(selectedControl.layer).activate();
                        if (selectedTool.toggle) {
                            selectedTool.active = !selectedTool.active;
                            selectedTool.onClick(selectedTool.active);
                        }
                        else if (selectedTool.button){
                            selectedTool.onClick();
                        }
                        else
                            selectedControl.activeTool = tool;
                    }
                }
            }
        } 
        ui.controls.render(); 
    }

    //////////////////////////////////////////////////////////////////////////////////////////

    updateDarkness(settings,context){
        if (MODULE.getPermission('OTHER','DARKNESS') == false ) {
            streamDeck.noPermission(context);
            return;
        }
        const func = settings.darknessFunction ? settings.darknessFunction : 'value';
        const value = parseFloat(settings.darknessValue) ? parseFloat(settings.darknessValue) : 0;
        const background = settings.background ? settings.background : '#000000';

        let src = "";
        let txt = "";

        if (func == 'value'){ //value
            src = 'modules/MaterialDeck/img/other/darkness/darkness.png';
        }
        else if (func == 'incDec'){ //increase/decrease
            if (value < 0) src = 'modules/MaterialDeck/img/other/darkness/decreasedarkness.png';
            else src = 'modules/MaterialDeck/img/other/darkness/increasedarkness.png';
        }
        else if (func == 'disp'){    //display darkness
            src = 'modules/MaterialDeck/img/other/darkness/darkness.png';
            const darkness = canvas.scene != null ? Math.floor(canvas.scene.data.darkness*100)/100 : '';
            txt += darkness;
        }
        streamDeck.setTitle(txt,context);
        streamDeck.setIcon(context,src,{background:background});
    }

    keyPressDarkness(settings) {
        if (canvas.scene == null) return;
        if (MODULE.getPermission('OTHER','DARKNESS') == false ) return;
        const func = settings.darknessFunction ? settings.darknessFunction : 'value';
        const value = parseFloat(settings.darknessValue) ? parseFloat(settings.darknessValue) : 0;

        if (func == 'value') //value
            canvas.scene.update({darkness: value});
        else if (func == 'incDec'){ //increase/decrease
            let darkness = canvas.scene.data.darkness - value;
            if (darkness > 1) darkness = 1;
            if (darkness < 0) darkness = 0;
            canvas.scene.update({darkness: darkness});
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////

    updateRollDice(settings,context){
        if (MODULE.getPermission('OTHER','DICE') == false ) {
            streamDeck.noPermission(context);
            return;
        }
        const background = settings.background ? settings.background : '#000000';
        let txt = '';

        if (settings.displayDiceName) txt = 'Roll: ' + settings.rollDiceFormula;

        streamDeck.setTitle(txt,context);
        streamDeck.setIcon(context,'',{background:background});
    }

    keyPressRollDice(settings,context){
        if (MODULE.getPermission('OTHER','DICE') == false ) return;
        if (settings.rollDiceFormula == undefined || settings.rollDiceFormula == '') return;
        const rollFunction = settings.rollDiceFunction ? settings.rollDiceFunction : 'public';

        let actor;
        let tokenControlled = false;

        if (MODULE.selectedTokenId != undefined) actor = canvas.tokens.children[0].children.find(p => p.id == MODULE.selectedTokenId).actor;
        if (actor != undefined) tokenControlled = true;

        let r;
        if (tokenControlled) r = new Roll(settings.rollDiceFormula,actor.getRollData());
        else r = new Roll(settings.rollDiceFormula);

        r.evaluate();
        
        if (rollFunction == 'public') {
            r.toMessage(r,{rollMode:"roll"})
        }
        else if (rollFunction == 'private') {
            r.toMessage(r,{rollMode:"selfroll"})
        }
        else if (rollFunction == 'sd'){
            let txt = settings.displayDiceName ? 'Roll: '+settings.rollDiceFormula + '\nResult: ' : '';
            txt += r.total;
            streamDeck.setTitle(txt,context);
            let data = this.rollData
            data[context] = {
                formula: settings.rollDiceFormula,
                result: txt
            }
            this.rollData = data;
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////

    updateRollTable(settings,context){
        const name = settings.rollTableName;
        if (name == undefined) return;
        if (MODULE.getPermission('OTHER','TABLES') == false ) {
            streamDeck.noPermission(context);
            return;
        }

        const background = settings.background ? settings.background : '#000000';
        const table = game.tables.getName(name);

        let txt = settings.displayRollName ? table.name : '';
        let src = settings.displayRollIcon ? table.data.img : '';

        if (table == undefined) {
            src = '';
            txt = '';
        }
        else {
            if (table.permission < 2 && MODULE.getPermission('OTHER','TABLES_ALL') == false ) {
                streamDeck.noPermission(context);
                return;
            }
        }

        streamDeck.setTitle(txt,context);
        streamDeck.setIcon(context,src,{background:background});
    }

    keyPressRollTable(settings){
        if (MODULE.getPermission('OTHER','TABLES') == false ) return;
        const name = settings.rollTableName;
        if (name == undefined) return;

        const func = settings.rolltableFunction ? settings.rolltableFunction : 'open';
        const table = game.tables.getName(name);

        if (table != undefined) {
            if (table.permission < 2 && MODULE.getPermission('OTHER','TABLES_ALL') == false ) return;
            if (func == 'open'){ //open
                const element = document.getElementById(table.sheet.id);
                if (element == null) table.sheet.render(true);
                else table.sheet.close();
            }
            else if (func == 'public') //Public roll
                table.draw({rollMode:"roll"});
            else if (func == 'private') //private roll
                table.draw({rollMode:"selfroll"});
        }
    }

    //////////////////////////////////////////////////////////////////////////////////////////

    getSidebarName(nr){
        let name;
        if (nr == 'chat') name = game.i18n.localize("SIDEBAR.TabChat");
        else if (nr == 'combat') name = game.i18n.localize("SIDEBAR.TabCombat");
        else if (nr == 'scenes') name = game.i18n.localize("SIDEBAR.TabScenes");
        else if (nr == 'actors') name = game.i18n.localize("SIDEBAR.TabActors");
        else if (nr == 'items') name = game.i18n.localize("SIDEBAR.TabItems");
        else if (nr == 'journal') name = game.i18n.localize("SIDEBAR.TabJournal");
        else if (nr == 'tables') name = game.i18n.localize("SIDEBAR.TabTables");
        else if (nr == 'playlists') name = game.i18n.localize("SIDEBAR.TabPlaylists");
        else if (nr == 'compendium') name = game.i18n.localize("SIDEBAR.TabCompendium");
        else if (nr == 'settings') name = game.i18n.localize("SIDEBAR.TabSettings");
        else if (nr == 'collapse') name = game.i18n.localize("SIDEBAR.CollapseToggle");
        return name;
    }

    getSidebarIcon(nr){
        let icon;
        if (nr == 'chat') icon = window.CONFIG.ChatMessage.sidebarIcon;
        else if (nr == 'combat') icon = window.CONFIG.Combat.sidebarIcon;
        else if (nr == 'scenes') icon = window.CONFIG.Scene.sidebarIcon;
        else if (nr == 'actors') icon = window.CONFIG.Actor.sidebarIcon;
        else if (nr == 'items') icon = window.CONFIG.Item.sidebarIcon;
        else if (nr == 'journal') icon = window.CONFIG.JournalEntry.sidebarIcon;
        else if (nr == 'tables') icon = window.CONFIG.RollTable.sidebarIcon;
        else if (nr == 'playlists') icon = window.CONFIG.Playlist.sidebarIcon;
        else if (nr == 'compendium') icon = "fas fa-atlas";
        else if (nr == 'settings') icon = "fas fa-cogs";
        else if (nr == 'collapse') icon = "fas fa-caret-right";
        return icon;
    }
    
    updateSidebar(settings,context){
        if (MODULE.getPermission('OTHER','SIDEBAR') == false ) {
            streamDeck.noPermission(context);
            return;
        }
        const sidebarTab = settings.sidebarTab ? settings.sidebarTab : 'chat';
        const background = settings.background ? settings.background : '#000000';
        const collapsed = ui.sidebar._collapsed;
        const ringOffColor = settings.offRing ? settings.offRing : '#000000';
        const ringOnColor = settings.onRing ? settings.onRing : '#00FF00';
        const ringColor = (sidebarTab == 'collapse' && collapsed) ? ringOnColor : ringOffColor;
        const name = settings.displaySidebarName ? this.getSidebarName(sidebarTab) : '';
        const icon = settings.displaySidebarIcon ? this.getSidebarIcon(sidebarTab) : '';

        streamDeck.setTitle(name,context);
        streamDeck.setIcon(context,icon,{background:background,ring:2,ringColor:ringColor});
    }

    keyPressSidebar(settings){
        if (MODULE.getPermission('OTHER','SIDEBAR') == false ) return;
        const sidebarTab = settings.sidebarTab ? settings.sidebarTab : 'chat';
        
        if (sidebarTab == 'collapse'){
            const collapsed = ui.sidebar._collapsed;
            if (collapsed) ui.sidebar.expand();
            else if (collapsed == false) ui.sidebar.collapse();
        }
        else ui.sidebar.activateTab(sidebarTab);
    }

    //////////////////////////////////////////////////////////////////////////////////////////

    updateCompendium(settings,context){
        const name = settings.compendiumName;
        if (name == undefined) return;
        if (MODULE.getPermission('OTHER','COMPENDIUM') == false ) {
            streamDeck.noPermission(context);
            return;
        }

        const compendium = game.packs.entries.find(p=>p.metadata.label == name);
        if (compendium == undefined) return;
        if (compendium.private && MODULE.getPermission('OTHER','COMPENDIUM_ALL') == false) {
            streamDeck.noPermission(context);
            return;
        }
        const background = settings.background ? settings.background : '#000000';
        const ringOffColor = settings.offRing ? settings.offRing : '#000000';
        const ringOnColor = settings.onRing ? settings.onRing : '#00FF00';
        const ringColor = compendium.rendered ? ringOnColor : ringOffColor;
        const txt = settings.displayCompendiumName ? name : '';

        streamDeck.setTitle(txt,context);
        streamDeck.setIcon(context,"",{background:background,ring:2,ringColor:ringColor});
    }

    keyPressCompendium(settings){
        let name = settings.compendiumName;
        if (name == undefined) return;
        if (MODULE.getPermission('OTHER','COMPENDIUM') == false ) return;

        const compendium = game.packs.entries.find(p=>p.metadata.label == name);
        if (compendium == undefined) return;
        if (compendium.private && MODULE.getPermission('OTHER','COMPENDIUM_ALL') == false) return;
        if (compendium.rendered) compendium.close();
        else compendium.render(true);
    }

    //////////////////////////////////////////////////////////////////////////////////////////

    updateJournal(settings,context){
        const name = settings.compendiumName;
        if (name == undefined) return;

        const journal = game.journal.getName(name);
        if (journal == undefined) return;

        if (MODULE.getPermission('OTHER','JOURNAL') == false ) {
            streamDeck.noPermission(context);
            return;
        }
        if (journal.permission < 2 && MODULE.getPermission('OTHER','JOURNAL_ALL') == false ) {
            streamDeck.noPermission(context);
            return;
        }

        const background = settings.background ? settings.background : '#000000';
        const ringOffColor = settings.offRing ? settings.offRing : '#000000';
        const ringOnColor = settings.onRing ? settings.onRing : '#00FF00';
        const ringColor = journal.sheet.rendered ? ringOnColor : ringOffColor;
        const txt = settings.displayCompendiumName ? name : '';

        streamDeck.setTitle(txt,context);
        streamDeck.setIcon(context,"",{background:background,ring:2,ringColor:ringColor});
    }

    keyPressJournal(settings){
        const name = settings.compendiumName;
        if (name == undefined) return;

        const journal = game.journal.getName(name);
        if (journal == undefined) return;

        if (MODULE.getPermission('OTHER','JOURNAL') == false ) return;
        if (journal.permission < 2 && MODULE.getPermission('OTHER','JOURNAL_ALL') == false ) return;

        const element = document.getElementById("journal-"+journal.id);
        if (element == null) journal.render(true);
        else journal.sheet.close();
    }

//////////////////////////////////////////////////////////////////////////////////////////

    updateChatMessage(settings,context){
        if (MODULE.getPermission('OTHER','CHAT') == false ) {
            streamDeck.noPermission(context);
            return;
        }
        const background = settings.background ? settings.background : '#000000';
        streamDeck.setTitle("",context);
        streamDeck.setIcon(context,"",{background:background});
    }

    keyPressChatMessage(settings){
        if (MODULE.getPermission('OTHER','CHAT') == false ) return;
        const message = settings.chatMessage ? settings.chatMessage : '';

        let chatData = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
            content: message
        };
        ChatMessage.create(chatData, {});
    }
}