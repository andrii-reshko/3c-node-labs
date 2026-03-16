const readBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      try {
        body += chunk.toString();
      } catch (err) {
        reject(err);
      }
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', (err) => {
      reject(err);
    });
  });
};

const responseJson = (res, statusCode, data) => {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json;charset=utf-8');
  if (data !== undefined) {
    res.end(JSON.stringify(data));
  } else {
    res.end();
  }
};

export { readBody, responseJson };
