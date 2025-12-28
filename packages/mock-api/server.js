module.exports = (req, res, next) => {
  // CORS headers
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', '*')
  res.header('Access-Control-Allow-Methods', '*')
  
  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200)
  }
  
  // Optional: Simulate network delay
  if (process.env.SIMULATE_DELAY) {
    const delay = parseInt(process.env.SIMULATE_DELAY) || 200
    setTimeout(next, delay)
  } else {
    next()
  }
}

