import pg from 'pg';
const { Client } = pg;

const client = new Client({
  host: 'db.bbzcwxllbvgjfwxpuxkz.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'vanku3-sogcaj-Zekxut',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    console.log('Connecting to Supabase...');
    await client.connect();
    console.log('Connected! Creating tables...');

    await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        avatar_url TEXT,
        phone TEXT,
        role TEXT DEFAULT 'user',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('  users OK');

    await client.query(`
      CREATE TABLE IF NOT EXISTS properties (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT NOT NULL,
        description TEXT,
        price DECIMAL(12,2) NOT NULL,
        property_type TEXT NOT NULL,
        listing_type TEXT DEFAULT 'sale',
        bedrooms INT DEFAULT 0,
        bathrooms INT DEFAULT 0,
        total_area DECIMAL(10,2),
        location TEXT NOT NULL,
        island TEXT NOT NULL,
        coordinates DECIMAL[],
        images TEXT[],
        features TEXT[],
        agent_id UUID REFERENCES users(id),
        is_featured BOOLEAN DEFAULT false,
        is_verified BOOLEAN DEFAULT false,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('  properties OK');

    await client.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(user_id, property_id)
      )
    `);
    console.log('  favorites OK');

    await client.query(`
      CREATE TABLE IF NOT EXISTS inquiries (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log('  inquiries OK');

    console.log('Seeding properties...');

    const props = [
      {t:'Modern Beachfront Villa',d:'Stunning villa with ocean views',p:450000,pt:'Villa',b:4,ba:3,a:280,l:'Santa Maria, Sal',i:'Sal',img:'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800',f:['Ocean View','Pool','Garden'],fe:true},
      {t:'City Center Apartment',d:'Modern apartment in Praia',p:185000,pt:'Apartment',b:2,ba:2,a:95,l:'Praia, Santiago',i:'Santiago',img:'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',f:['City View','Balcony'],fe:false},
      {t:'Ocean View Penthouse',d:'Luxury penthouse in Mindelo',p:680000,pt:'Penthouse',b:3,ba:3,a:220,l:'Mindelo, Sao Vicente',i:'Sao Vicente',img:'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',f:['Ocean View','Terrace'],fe:true},
      {t:'Traditional Stone House',d:'Charming renovated house',p:220000,pt:'House',b:3,ba:2,a:150,l:'Ribeira Grande, Santo Antao',i:'Santo Antao',img:'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800',f:['Mountain View','Garden'],fe:false},
      {t:'Beachfront Resort Condo',d:'Investment opportunity',p:320000,pt:'Apartment',b:1,ba:1,a:65,l:'Sal Rei, Boa Vista',i:'Boa Vista',img:'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',f:['Beach Access','Resort'],fe:true},
      {t:'Mountain Retreat',d:'Peaceful mountain property',p:175000,pt:'House',b:2,ba:1,a:120,l:'Cha das Caldeiras, Fogo',i:'Fogo',img:'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800',f:['Mountain View','Garden'],fe:false},
      {t:'Luxury Beach Villa',d:'Exclusive beachfront property',p:890000,pt:'Villa',b:5,ba:4,a:350,l:'Santa Maria, Sal',i:'Sal',img:'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',f:['Private Beach','Pool'],fe:true},
      {t:'Modern Studio',d:'Perfect for investors',p:95000,pt:'Apartment',b:0,ba:1,a:45,l:'Praia, Santiago',i:'Santiago',img:'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',f:['City Center','Modern'],fe:false},
      {t:'Seaside Townhouse',d:'Steps from the beach',p:275000,pt:'Townhouse',b:3,ba:2,a:160,l:'Tarrafal, Santiago',i:'Santiago',img:'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=800',f:['Near Beach','Terrace'],fe:false},
      {t:'Investment Land',d:'Prime development land',p:150000,pt:'Land',b:0,ba:0,a:1500,l:'Espargos, Sal',i:'Sal',img:'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800',f:['Building Permit'],fe:false}
    ];

    for (const pr of props) {
      await client.query(
        `INSERT INTO properties (title, description, price, property_type, listing_type, bedrooms, bathrooms, total_area, location, island, images, features, is_featured, is_verified, status)
         VALUES ($1, $2, $3, $4, 'sale', $5, $6, $7, $8, $9, ARRAY[$10], $11, $12, true, 'active')
         ON CONFLICT DO NOTHING`,
        [pr.t, pr.d, pr.p, pr.pt, pr.b, pr.ba, pr.a, pr.l, pr.i, pr.img, pr.f, pr.fe]
      );
    }

    const res = await client.query('SELECT COUNT(*) FROM properties');
    console.log('SUCCESS! Properties:', res.rows[0].count);

    await client.end();
  } catch (err) {
    console.error('Error:', err.message);
    await client.end();
  }
}

run();
