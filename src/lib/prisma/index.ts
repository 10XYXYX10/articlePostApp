import { PrismaClient } from '@prisma/client'

declare let global: { prisma: PrismaClient }

let prisma: PrismaClient

//本番環境
if (process.env.NODE_ENV === 'production') {
  //クラス「PrismaClient」のインスタンスを生成し、変数「prisma」に代入
  prisma = new PrismaClient()
  
//開発環境
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient()
  }
  prisma = global.prisma
}
export default prisma