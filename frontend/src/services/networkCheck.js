export const checkApiConnection = async () => {
    try {
      await fetch('http://localhost:8000/conversions');
      return true;
    } catch (error) {
      return false;
    }
};