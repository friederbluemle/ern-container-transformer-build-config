import fs from 'fs'

export const exists = async (path: fs.PathLike): Promise<boolean> =>
  new Promise<boolean>(resolve => {
    fs.exists(path, res => {
      resolve(res)
    })
  })

export const readDir = async (path: fs.PathLike): Promise<string[]> =>
  new Promise<string[]>((resolve, reject) => {
    fs.readdir(path, (err, files: string[]) => {
      err ? reject(err) : resolve(files)
    })
  })

export const readFile = async (path: string): Promise<Buffer> =>
  new Promise<Buffer>((resolve, reject) => {
    fs.readFile(path, (err, data: Buffer) => {
      err ? reject(err) : resolve(data)
    })
  })

export const writeFile = async (path: string, data: any): Promise<void> =>
  new Promise<void>((resolve, reject) => {
    fs.writeFile(path, data, err => {
      err ? reject(err) : resolve()
    })
  })
