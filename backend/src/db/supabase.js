const { createClient } = require('@supabase/supabase-js')
const WebSocket = require('ws')
require('dotenv').config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

function createMissingEnvClient() {
  return {
    from() {
      throw new Error('SUPABASE_URL dan SUPABASE_SERVICE_KEY wajib diisi di environment variables')
    }
  }
}

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      },
      realtime: {
        transport: WebSocket
      }
    })
  : createMissingEnvClient()

module.exports = supabase
