// "public" methods are created as object members
// "private" ones are just non-exported class methods.
const Client = Object.seal({
  getAvailableServerID: async () => {
    return await send("/serverid", "GET");
  },
});

async function send(path, method, body) {
  const options = {
    method: method,
    headers: { "Content-type": "application/json" },
  };
  if (method == "POST" && body != undefined) {
    options.body = JSON.stringify(body);
  }
  const response = await fetch(path, options).then((res) => res.json());
  return response;
}

export { Client };
