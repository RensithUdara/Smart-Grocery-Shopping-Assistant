"""
Data manager factory to provide the appropriate data manager based on configuration
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_data_manager():
    """
    Factory function to get the appropriate data manager
    Returns DatabaseDataManager if USE_DATABASE=true, otherwise legacy DataManager
    """
    use_database = os.getenv('USE_DATABASE', 'false').lower() == 'true'
    
    if use_database:
        from src.utils.database_data_manager import DatabaseDataManager
        return DatabaseDataManager(use_database=True)
    else:
        from src.utils.data_manager import DataManager
        return DataManager()

# Create a singleton instance
_data_manager = None

def get_data_manager_instance():
    """Get singleton data manager instance"""
    global _data_manager
    if _data_manager is None:
        _data_manager = get_data_manager()
    return _data_manager