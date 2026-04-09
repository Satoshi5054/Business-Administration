import { prisma } from "@/lib/prisma"
import { JwtPayload } from "@/lib/jwt"

// Returns meetings for a given month where the current user is a participant.

export const getMonthMeetings = async (user: JwtPayload, month: number, year: number)=> {
    const start = new Date(year, month, 1)
    const end = new Date( year, month+1, 0)

    return prisma.meeting.findMany({
        where: {
            companyId : user.companyId,
            startTime : {
                gte : start,
                lte : end
            },
            participants:{
                some: {
                    userId : user.userId
                }
            }
        },
        include:{
            participants :{
                include:{
                    user: true
                }
            }
        }
    })
}

// Returns only today's meetings for the current user.

export const getTodayMeetings = async (user: JwtPayload)=>{
    const start = new Date()
    start.setHours(0,0,0,0)

    const end = new Date()
    end.setHours(23,59,59,999)

    return prisma.meeting.findMany({
        where: {
            companyId : user.companyId,
            startTime :{
                gte: start,
                lte: end
            },
            participants : {
                some: {
                    userId: user.userId
                }
            }
        },
        include: {
            participants:{
                include:{
                    user: true
                }
            }
        }
    })
}

// Creates a meeting and automatically includes the creator in participants.

export const createMeeting = async (user: JwtPayload,body: any) => {
    if (user.role === "VIEWER") {
        throw new Error("Unauthorized")
    }

    const {
        title,
        description,
        startTime,
        endTime,
        location,
        participants = []
    } = body

    return prisma.meeting.create({
        data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        location,
        companyId: user.companyId,
        createdById: user.userId,
        participants: {
            create: [
            ...participants.map((id: string) => ({
                userId: id
            })),
            { userId: user.userId } 
            ]
        }
        }
    })
}

// Allows updates only from the meeting creator or an admin.

export const updateMeeting = async (user: JwtPayload,meetingId: string,body: any) => {
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId }
  })

  if (!meeting || meeting.companyId !== user.companyId) {
    throw new Error("Meeting not found")
  }

  // Keep edit permissions strict to avoid cross-team accidental updates.
  if (
    meeting.createdById !== user.userId &&
    user.role !== "ADMIN"
  ) {
    throw new Error("Unauthorized")
  }

  return prisma.meeting.update({
    where: { id: meetingId },
    data: body
  })
}

// Allows deletion only from the meeting creator or an admin.

export const deleteMeeting = async (user: JwtPayload,meetingId: string) => {
  const meeting = await prisma.meeting.findUnique({
    where: { id: meetingId }
  })

  if (!meeting || meeting.companyId !== user.companyId) {
    throw new Error("Meeting not found")
  }

  // Same permission rule as update: creator or admin only.
  if (
    meeting.createdById !== user.userId &&
    user.role !== "ADMIN"
  ) {
    throw new Error("Unauthorized")
  }

  return prisma.meeting.delete({
    where: { id: meetingId }
  })
}