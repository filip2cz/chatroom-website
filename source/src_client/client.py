import socket as sc
from threading import Thread
from time import sleep

from security import *
from constants import *
from gui import *


class Client:
    class Conn(Thread):
        def __init__(self, client):
            Thread.__init__(self)
            self.client = client

        def run(self):
            def get_name(msg: str):
                spl = msg.split(NAME_SPLITTER)
                return spl[0], NAME_SPLITTER.join(spl[1:])

            while self.client.running:
                try:
                    msg = self.client.recv_decrypted()
                    name, msg = get_name(msg)
                except ConnectionAbortedError as e:
                    print('Connection aborted')
                    self.client.gui.execute(lambda: (sg.PopupError('Connection aborted')))
                    self.client.client=None
                except KeyboardInterrupt:
                    raise KeyboardInterrupt
                except Exception as e:
                    print(f'[!] Error occured ({e}), closing connection')
                    self.client.gui.execute(lambda: (sg.PopupError(
                        f'Error occured ({e}), closing connection')))
                    self.client.gui.disconnect()
                    # self.client.running = False
                    # self.client.sock.close()
                    # self.client.client = None
                # self.client.gui.gui_queue.append(lambda: self.client.gui.chatText.print(f' {name} >>> {msg}'))
                self.client.gui.chatText.print(f' {name} > {msg}')
                self.client.gui.set_nick(name)
                # print('\r  ' + name + ' >>> ' + msg)
                # print('\n\r you >>> ', end='')

    def __init__(self, hostip: str, hostport: int, gui: Program):
        self.hip=hostip
        self.hport=hostport
        self.haddr=(self.hip, self.hport)

        self.gui=gui

        self.running=True

        self.sock=sc.socket(sc.AF_INET, sc.SOCK_STREAM)
        self.sock.connect(self.haddr)

        self.prv_key, self.pbl_key=generate_keys()
        self.send(self.pbl_key.export_key())
        self.h_key=import_key(self.recv())
        self.nick=self.recv_decrypted()

        sleep(SLEEP_AMOUNT)

        self.conn_thread=self.Conn(self)
        self.conn_thread.start()

        # self.run()

    def run(self):
        while self.running:
            msg=input('  you >>> ')
            self.send_encrypted(msg)

    def send(self, msg: bytes):
        self.sock.send(bytes(str(len(msg)).zfill(
            MSG_ZFILL), encoding=ENCODING) + msg)

    def send_encrypted(self, msg: str):
        msg_bytes=encrypt(msg, self.h_key)
        self.send(msg_bytes)

    def recv(self):
        n_bytes=int(self.sock.recv(MSG_ZFILL))
        msg_bytes=self.sock.recv(n_bytes)
        return msg_bytes

    def recv_decrypted(self):
        msg_bytes=self.recv()
        return decrypt(msg_bytes, self.prv_key)
