const controllerWrapper = (controller) => {
  return async (req, res, next) => {
    try {
      await controller(req, res, next);
    } catch (error) {
      if (error.code === 'P2002') {
        error.status = 409; 
        error.message = 'Conflict: Duplicate unique value.';
      }
      if (error.code === 'P2003') {
        error.status = 400; 
        error.message = 'Bad Request: Related record not found.';
      }
      if (error.code === 'P2025') {
        error.status = 404; 
        error.message = 'Not Found';
      }

      next(error);
    }
  };
};

export default controllerWrapper;
