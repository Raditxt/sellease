# backend/routes/products.py

from flask import Blueprint, request, jsonify
from db import get_db_connection

products_bp = Blueprint('products', __name__)

@products_bp.route('/products', methods=['GET'])
def get_products():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM products ORDER BY id DESC")
    products = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(products)

@products_bp.route('/products', methods=['POST'])
def add_product():
    data = request.json
    name = data.get('name')
    sku = data.get('sku')
    category = data.get('category')
    price = data.get('price')
    stock = data.get('stock')
    threshold = data.get('low_stock_threshold', 5)

    if not name or not sku or not price or stock is None:
        return jsonify({'error': 'Field tidak lengkap'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            INSERT INTO products (name, sku, category, price, stock, low_stock_threshold)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (name, sku, category, price, stock, threshold))
        conn.commit()
        return jsonify({'message': 'Produk berhasil ditambahkan'}), 201
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@products_bp.route('/products/<int:id>', methods=['PUT'])
def update_product(id):
    data = request.json
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("""
            UPDATE products SET name=%s, sku=%s, category=%s, price=%s, stock=%s, low_stock_threshold=%s
            WHERE id=%s
        """, (
            data['name'], data['sku'], data['category'], data['price'], data['stock'],
            data.get('low_stock_threshold', 5), id
        ))
        conn.commit()
        return jsonify({'message': 'Produk berhasil diupdate'})
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@products_bp.route('/products/<int:id>', methods=['DELETE'])
def delete_product(id):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        cursor.execute("DELETE FROM products WHERE id=%s", (id,))
        conn.commit()
        return jsonify({'message': 'Produk berhasil dihapus'})
    except Exception as e:
        conn.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        cursor.close()
        conn.close()
