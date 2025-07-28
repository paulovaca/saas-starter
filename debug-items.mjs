import postgres from 'postgres';
import { config } from 'dotenv';

config();

async function debugItems() {
  console.log('🔍 Debugging base items and custom fields...');
  
  try {
    const sql = postgres(process.env.DATABASE_URL);
    
    // Get all base items
    const baseItems = await sql`SELECT * FROM base_items WHERE agency_id = '24d896d6-e7ee-4be6-a4b3-2b5714802e88'`;
    console.log('📦 Total base items:', baseItems.length);
    
    if (baseItems.length > 0) {
      console.log('📋 Base items:');
      baseItems.forEach((item, index) => {
        console.log(`${index + 1}. ${item.name} (${item.id}) - Active: ${item.is_active}`);
      });
      
      // Get custom fields for these items
      const customFields = await sql`SELECT * FROM base_item_fields WHERE base_item_id = ANY(${baseItems.map(i => i.id)})`;
      console.log('\n🎛️ Custom fields:', customFields.length);
      
      if (customFields.length > 0) {
        customFields.forEach((field, index) => {
          console.log(`${index + 1}. ${field.name} (${field.type}) for item ${field.base_item_id} - Required: ${field.is_required}`);
        });
      } else {
        console.log('❌ No custom fields found for base items');
      }
    } else {
      console.log('❌ No base items found');
    }
    
    await sql.end();
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugItems();