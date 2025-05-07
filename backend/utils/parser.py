import argparse

def parse_arguments():

    args = argparse.ArgumentParser(formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    # parser = argparse.ArgumentParser( prog='ProgramName', description='Parametri in ingresso', epilog='Testo di aiuto')

    args.add_argument('--ip', type=str, default=None, help='ip of the socker')
    args.add_argument('--porta_sorgente', type=int, default=80, help='Port number of sorgent')
    args.add_argument('--porta_destinazione', type=int, default=90, help='Port number of destination')

    return args