import PySimpleGUI as sg
import os
import signal
from client import *


class Program:
    def __init__(self):
        # sg.theme('DarkBrown4')
        sg.theme('Black')
        self.layout = [
            [
                sg.Text('Server IP'),
                sg.InputText(key='hip', size=(30, 1)),
                sg.Text('Server Port'),
                sg.InputText(key='hport', size=(10, 1),
                             default_text=str(PORT)),
                sg.Button(button_text='Connect', key='connect_btn')
            ], [sg.Text(' '*100, key='nick_txt')],
            [
                sg.Multiline(key='chat', size=(100, 30),
                             disabled=True, font=('Arial',))
            ],
            [
                sg.Text('Msg'),
                sg.InputText(key='msg_inp', size=(86, 1)),
                sg.Button(button_text='Send', key='send_btn',
                          bind_return_key=True),
                # sg.Text('Can\'t send more than 207 minus nick lenght characters')
            ]
        ]

        self.window = sg.Window('ChatRoom', self.layout)
        self.chatText = self.window.find_element('chat')
        self.hip_inp = self.window.find_element('hip')
        self.hport_inp = self.window.find_element('hport')
        self.msg_inp = self.window.find_element('msg_inp')
        self.connect_btn = self.window.find_element('connect_btn')
        self.nick_txt = self.window.find_element('nick_txt')

        self.gui_queue = []

        self.client = None

        while True:
            event, values = self.window.read()
            # End program if user closes window or
            if event in (None, 'Exit', sg.WIN_CLOSED):
                break

            if event == 'send_btn':
                if self.is_connected():
                    msg = self.msg_inp.Get()
                    if len(msg) >= 207 - len(self.client.nick):
                        sg.PopupError('Message too long', keep_on_top=True)
                    else:
                        self.client.send_encrypted(self.msg_inp.Get())
                        self.msg_inp.Update('')
                        self.window.finalize()
                else:
                    sg.PopupError('Connect to server first', keep_on_top=True)

            if event == 'connect_btn':
                self.connect(self.hip_inp.Get(), int(self.hport_inp.Get()))

            for to_do in self.gui_queue:
                to_do()
            self.gui_queue.clear()

        self.window.close()
    def connect(self, ip, port):
        try:
            self.disconnect()
            self.client = Client(ip, port, self)
            self.set_nick(self.client.nick)
        except Exception as e:
            sg.PopupError('Can\'t connect')
            
    def disconnect(self):
        if self.client:
            self.client.running = False
            self.client.sock.close()
        self.client = None

    def set_nick(self, nick):
        self.nick_txt.Update(value=nick)

    def is_connected(self):
        return bool(self.client)
    
    def execute(self, to_do):
        self.gui_queue += to_do


def close():
    os.kill(os.getpid(), signal.SIGINT)


if __name__ == '__main__':
    print(f'[*] You are running version {VERSION}')
    Program()
    close()
