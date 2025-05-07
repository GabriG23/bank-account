import logging

def setup_logging(log_level="ERROR"):
    # Setup del logging
    logging.basicConfig()
    logging.getLogger().setLevel(log_level)
    logging.debug("Logging level set to {0}".format(log_level))
