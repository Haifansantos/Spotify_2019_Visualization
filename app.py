from flask import Flask, jsonify, render_template
import pandas as pd

app = Flask(__name__)

# === ROUTE UTAMA ===
@app.route('/')
def index():
    return render_template('index.html')

# === ROUTE UNTUK DATA ===
@app.route('/data')
def get_data():
    # Baca CSV
    df = pd.read_csv('data/songs_normalize.csv')

    # Pastikan kolom yang dibutuhkan ada
    columns = ['artist', 'song', 'year', 'popularity', 'danceability', 'energy', 'valence', 'tempo', 'genre']
    df = df[columns].copy()

    # Bersihkan data kosong atau NaN
    df['song'] = df['song'].fillna('(No Title)').replace('', '(No Title)')
    df['artist'] = df['artist'].fillna('(Unknown Artist)').replace('', '(Unknown Artist)')

    # Buang baris yang nilainya invalid
    df = df.dropna(subset=['popularity', 'danceability', 'energy', 'valence', 'tempo'])

    # Ubah jadi list of dict agar bisa dikirim ke frontend
    return jsonify(df.to_dict(orient='records'))

# === RUN APLIKASI ===
if __name__ == '__main__':
    app.run(debug=True)
