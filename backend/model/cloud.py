from flask import Flask, request, send_file, jsonify
import io

from google.cloud import storage
import os

app = Flask(__name__)

os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "key.json"

client = storage.Client()
bucket_name = "leetpath-images"


@app.route('/upload', methods=['POST'])
def upload_file():
    """Upload a file to Google Cloud Storage with a specified filename."""
    try:
        # Check if the request contains the file part
        if 'file' not in request.files:
            return jsonify({"error": "No file part in the request."}), 400

        file = request.files['file']

        # Retrieve the desired filename from the form data
        filename = request.form.get('filename')
        if not filename:
            return jsonify({"error": "No filename provided in the form data."}), 400

        # Create a blob in the specified bucket with the provided filename
        blob = client.bucket(bucket_name).blob(filename)
        blob.upload_from_file(file)

        return jsonify({"message": f"File uploaded successfully as {filename}."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/delete', methods=['DELETE'])
def delete_file():
    """Delete a file from Google Cloud Storage."""
    try:
        filename = request.args.get('filename')
        blob = client.bucket(bucket_name).blob(filename)
        blob.delete()
        return jsonify({"message": f"File {filename} deleted successfully."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/download', methods=['POST'])
def download_file():
    """Download a file from Google Cloud Storage."""
    try:
        data = request.get_json()
        if not data or 'filename' not in data:
            return jsonify({"error": "Filename is required in the request body."}), 400

        filename = data['filename']
        bucket = client.bucket(bucket_name)
        blob = bucket.blob(filename)

        if not blob.exists():
            return jsonify({"error": f"File '{filename}' not found in bucket '{bucket_name}'."}), 404

        # Download the file's content as bytes
        file_data = blob.download_as_bytes()

        # Create a BytesIO object from the file data
        file_stream = io.BytesIO(file_data)
        file_stream.seek(0)

        content_type = blob.content_type or 'application/octet-stream'

        return send_file(
            file_stream,
            mimetype=content_type,
            as_attachment=True,
            download_name=filename
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route('/rename', methods=['POST'])
def rename_file():
    """Rename a file in Google Cloud Storage."""
    try:
        old_name = request.json['old_name']
        new_name = request.json['new_name']
        bucket = client.bucket(bucket_name)
        blob = bucket.blob(old_name)
        new_blob = bucket.rename_blob(blob, new_name)
        return jsonify({"message": f"File renamed from {old_name} to {new_blob.name}."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
