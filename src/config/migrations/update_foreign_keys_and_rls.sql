-- First drop existing constraints
ALTER TABLE orders 
    DROP CONSTRAINT IF EXISTS fk_orders_user,
    DROP CONSTRAINT IF EXISTS fk_orders_store,
    DROP CONSTRAINT IF EXISTS orders_store_id_fkey,
    DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

ALTER TABLE order_items
    DROP CONSTRAINT IF EXISTS fk_order_items_order,
    DROP CONSTRAINT IF EXISTS fk_order_items_menu_item,
    DROP CONSTRAINT IF EXISTS order_items_order_id_fkey,
    DROP CONSTRAINT IF EXISTS order_items_menu_item_id_fkey;

-- Update foreign key constraints for orders table
ALTER TABLE orders 
    ALTER COLUMN user_id SET NOT NULL,
    ALTER COLUMN store_id SET NOT NULL,
    ADD CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    ADD CONSTRAINT fk_orders_store FOREIGN KEY (store_id) REFERENCES stores(id) ON DELETE RESTRICT;

-- Update foreign key constraints for order_items table
ALTER TABLE order_items
    ALTER COLUMN order_id SET NOT NULL,
    ALTER COLUMN menu_item_id SET NOT NULL,
    ADD CONSTRAINT fk_order_items_order FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    ADD CONSTRAINT fk_order_items_menu_item FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE RESTRICT;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can view their own order items" ON order_items;
DROP POLICY IF EXISTS "Users can view their own orders with related data" ON orders;
DROP POLICY IF EXISTS "Public can view store data through orders" ON stores;
DROP POLICY IF EXISTS "Users can view user data through orders" ON users;

-- Create new RLS policies
CREATE POLICY "Users can view their own orders with related data" ON orders
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = orders.user_id 
            AND users.id = auth.uid()
        )
    );

CREATE POLICY "Public can view store data through orders" ON stores
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.store_id = stores.id
        )
    );

CREATE POLICY "Users can view user data through orders" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM orders 
            WHERE orders.user_id = users.id
        )
    ); 