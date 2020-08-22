const setCache = (key, data) => LOCKBOX_APP.put(key, data)
const getCache = key => LOCKBOX_APP.get(key)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

async function getData(request) {
  const params = request.url.split('?')[1]
  if (params){
    const cacheKey = params.split('=')[1]
    if (cacheKey){
      let data
      const cache = await getCache(cacheKey)
      if (!cache) {
        return new Response(null, {
          status:404,
        })
      } else {
        data = JSON.parse(cache)        
        return new Response(JSON.stringify({'data':data.content}), {
          status:200,
          headers: corsHeaders
        })
      }
    }    
  }
  else {
    return new Response(null, {
      status:404,
      headers: corsHeaders
    })
  }
}

async function postData(request) {  
  const ip = request.headers.get('CF-Connecting-IP')
  const json = await request.json() 
  
  try {
    const cacheKey = json.hash
    let data = request.headers
    data.content = json.data
    await setCache(cacheKey, JSON.stringify(data))
    return new Response(JSON.stringify({"saved":"true"}), { 
      status: 200,
      headers: corsHeaders
     })
  } catch (err) {
    console.log(err)
    return new Response(err, { status: 500 })
  }
}

function handleOptions(request) {
  return new Response(null, {
    headers: corsHeaders
  })
}

async function handleRequest(request) {
  if (request.method === 'POST') {
    return postData(request)
  } else if (request.method === 'GET') {
    return getData(request)
  } if (request.method === "OPTIONS") {
    return handleOptions(request)
  }else {
    return new Response(null, {
      status: 405,
      statusText: "Method Not Allowed",
    })
  }
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})