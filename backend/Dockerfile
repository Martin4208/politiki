# 1. PostgreSQLの公式イメージをベースにする
FROM postgres:16

# 2. pgvectorのビルドに必要なツールをインストール
RUN apt-get update && apt-get install -y \
    postgresql-server-dev-16 \
    gcc \
    make\
    git \
    && rm -rf /var/lib/api/lists/*

# 3. pgvectorのソースコードを負う式から持ってきてインストール
RUN git clone --branch v0.8.0 https://github.com/pgvector/pgvector.git \
    && cd pgvector \
    && make \
    && make install \
    && cd ..\
    && rm -rf pgvector