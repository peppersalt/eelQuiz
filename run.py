import eel
import bottle_websocket
import main


eel.init('templates')
eel.start('login.html', size=(1920, 1200), mode='default')
