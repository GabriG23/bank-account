class User():
    def __init__(self, id, nome, cognome, mail, password):
        self.id = id
        self.__nome = nome
        self.__cognome = cognome
        self.__mail = mail
        self.__password = password