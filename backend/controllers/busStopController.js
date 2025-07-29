const BusStop = require('../models/BusStop');
const { successResponse, errorResponse } = require('../utils/responseUtil');

const getBusStops = async (req, res) => {
  const { route = 'all', enabled = 'all' } = req.query;
  const filter = {};
  if (route !== 'all') filter.route = route;
  if (enabled !== 'all') filter.enabled = enabled === 'true';
  try {
    const busStops = await BusStop.find(filter).sort({ order: 1 });
    return successResponse(res, busStops);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const createBusStop = async (req, res) => {
  const { name, code, route, latitude, longitude, address } = req.body;
  try {
    const busStop = new BusStop({
      name,
      code: code.toUpperCase(),
      route,
      latitude,
      longitude,
      address,
      createdBy: req.user.id,
    });
    await busStop.save();
    return successResponse(res, busStop);
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const updateBusStop = async (req, res) => {
  const { id } = req.params;
  const { name, code, route, latitude, longitude, address } = req.body;
  
  try {
    const busStop = await BusStop.findByIdAndUpdate(
      id,
      {
        name,
        code: code.toUpperCase(),
        route,
        latitude,
        longitude,
        address,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!busStop) {
      return errorResponse(res, 'Bus stop not found', 404);
    }

    return successResponse(res, busStop, 'Bus stop updated successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const deleteBusStop = async (req, res) => {
  const { id } = req.params;
  
  try {
    const busStop = await BusStop.findByIdAndDelete(id);
    
    if (!busStop) {
      return errorResponse(res, 'Bus stop not found', 404);
    }

    return successResponse(res, null, 'Bus stop deleted successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const activateBusStop = async (req, res) => {
  const { id } = req.params;
  
  try {
    const busStop = await BusStop.findByIdAndUpdate(
      id,
      { enabled: true, updatedAt: new Date() },
      { new: true }
    );

    if (!busStop) {
      return errorResponse(res, 'Bus stop not found', 404);
    }

    return successResponse(res, busStop, 'Bus stop activated successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

const deactivateBusStop = async (req, res) => {
  const { id } = req.params;
  
  try {
    const busStop = await BusStop.findByIdAndUpdate(
      id,
      { enabled: false, updatedAt: new Date() },
      { new: true }
    );

    if (!busStop) {
      return errorResponse(res, 'Bus stop not found', 404);
    }

    return successResponse(res, busStop, 'Bus stop deactivated successfully');
  } catch (err) {
    return errorResponse(res, err.message, 500);
  }
};

module.exports = { 
  getBusStops, 
  createBusStop, 
  updateBusStop, 
  deleteBusStop, 
  activateBusStop, 
  deactivateBusStop 
};